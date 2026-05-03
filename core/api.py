"""Python API exposed to JavaScript via pywebview.

Methods on this class are callable from the frontend as
``window.pywebview.api.method_name(...)`` and return Promises in JS.

This is a thin JSON-friendly façade over the pure functions in
``core.{mods, profile, files, launcher, paths}``. The legacy Tk app
(anno117-modmanager.py) calls into the same modules — so logic only lives
once and a fix benefits both UIs.
"""
from __future__ import annotations

import base64
import json
import mimetypes
import os
import platform
from typing import Any

from . import files as files_module
from . import launcher as launcher_module
from . import mods as mods_module
from . import paths as paths_module
from . import profile as profile_module

IS_WINDOWS = platform.system() == 'Windows'


def _appdata_dir() -> str:
    if IS_WINDOWS:
        root = os.getenv('APPDATA') or os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming')
    else:
        root = os.getenv('XDG_CONFIG_HOME') or os.path.join(os.path.expanduser('~'), '.config')
    return os.path.join(root, 'Anno 117 Mod Manager')


class Api:
    def __init__(self) -> None:
        self.appdata = _appdata_dir()
        self.settings_file = os.path.join(self.appdata, 'settings.json')
        self.presets_dir = os.path.join(self.appdata, 'presets')
        self.settings: dict[str, Any] = self._load_settings()

    # ── settings ──────────────────────────────────────────────────────────────
    def _load_settings(self) -> dict[str, Any]:
        if not os.path.exists(self.settings_file):
            return {}
        try:
            with open(self.settings_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            return {}

    def get_settings(self) -> dict[str, Any]:
        return self.settings

    # ── mods ──────────────────────────────────────────────────────────────────
    def list_mods(self) -> list[dict]:
        """Scan mod folders and return enriched mod dicts (active flag included)."""
        game_path = self.settings.get('game_path', '')
        custom_docs = self.settings.get('custom_docs_path', '')
        lang = self.settings.get('selected_language', 'english')
        mods = mods_module.list_mods(game_exe_path=game_path, custom_docs=custom_docs, lang=lang)

        profile_path = self._active_profile_path()
        enabled_ids = profile_module.parse_enabled_ids(profile_path)
        enable_new = profile_module.is_enable_new_mods(profile_path)
        for mod in mods:
            mid = mod['id']
            if mid in enabled_ids:
                mod['active'] = True
            elif enable_new and not profile_module.mod_id_appears(profile_path, mid):
                mod['active'] = True
            else:
                mod['active'] = False
        return mods

    def toggle_mod(self, mod_id: str, should_be_active: bool) -> dict:
        """Comment / uncomment ``mod_id`` in active-profile.txt."""
        ok, err = profile_module.toggle_mod(self._active_profile_path(), mod_id, should_be_active)
        return {'ok': ok, 'active': should_be_active, 'error': err}

    def set_all_active(self, active: bool) -> dict:
        """Bulk activate or deactivate every installed top-level mod."""
        # Sub-mods are handled by the loader via the parent — only list ids of
        # top-level mods.
        ids = [m['id'] for m in self.list_mods() if not m.get('parent_path')]
        ok, err = profile_module.write_set_all(self._active_profile_path(), ids, active)
        return {'ok': ok, 'error': err}

    def uninstall_mod(self, folder: str) -> dict:
        """Delete a mod folder. ``folder`` must be a basename (no slashes)
        and we restrict the rmtree to the configured mod roots so a malicious
        JS payload can't delete anything outside them."""
        if not folder or '/' in folder or '\\' in folder or folder.startswith('.'):
            return {'ok': False, 'error': 'invalid folder name'}
        roots = self._mod_roots()
        # Find the actual location and delegate to safe_rmtree
        for root in roots:
            candidate = os.path.join(root, folder)
            if os.path.isdir(candidate):
                ok, err = files_module.safe_rmtree(candidate, roots)
                return {'ok': ok, 'error': err}
        return {'ok': False, 'error': f'folder not found: {folder}'}

    def open_path(self, path: str) -> dict:
        """Open a file or folder in the OS default file manager."""
        ok, err = files_module.open_path(path)
        return {'ok': ok, 'error': err}

    def open_mods_folder(self) -> dict:
        """Open the primary mods folder (Documents-side first, fall back to
        the game install dir)."""
        for root in self._mod_roots():
            return self.open_path(root)
        return {'ok': False, 'error': 'no mods folder configured'}

    def get_mod_banner(self, mod_id: str) -> dict:
        """Return the mod's local banner (banner.png / thumbnail.jpg) as a
        base64 data URL. Capped at ~5 MB to keep the bridge call light."""
        for m in self.list_mods():
            if m['id'] != mod_id:
                continue
            banner_name = m.get('banner') or ''
            if not banner_name:
                return {'ok': True, 'data_url': ''}
            full = os.path.join(m['path'], banner_name)
            if not os.path.isfile(full):
                return {'ok': True, 'data_url': ''}
            try:
                if os.path.getsize(full) > 5 * 1024 * 1024:
                    return {'ok': False, 'error': 'banner too large'}
                with open(full, 'rb') as f:
                    raw = f.read()
                mime, _ = mimetypes.guess_type(full)
                mime = mime or 'image/png'
                return {'ok': True, 'data_url': f'data:{mime};base64,{base64.b64encode(raw).decode()}'}
            except OSError as e:
                return {'ok': False, 'error': str(e)}
        return {'ok': False, 'error': 'mod not found'}

    # ── load order ────────────────────────────────────────────────────────────
    def get_profile_order(self) -> list[str]:
        """Return the list of mod IDs in the order they currently appear in
        active-profile.txt (active or commented). Drives the Load Order view."""
        return profile_module.parse_profile_order(self._active_profile_path())

    def reorder_mods(self, ordered_ids: list[str]) -> dict:
        """Rewrite active-profile.txt with the given order. Active/disabled
        state per mod is preserved from the existing file."""
        if not isinstance(ordered_ids, list):
            return {'ok': False, 'error': 'expected a list of ids'}
        ok, err = profile_module.reorder_profile(self._active_profile_path(), ordered_ids)
        return {'ok': ok, 'error': err}

    # ── presets ───────────────────────────────────────────────────────────────
    def list_presets(self) -> list[str]:
        """Return user-saved preset names (without file extension)."""
        return profile_module.list_presets(self.presets_dir)

    def save_preset(self, name: str) -> dict:
        """Snapshot the current active-profile.txt as ``presets/<name>.txt``."""
        ok, err = profile_module.save_preset(self.presets_dir, self._active_profile_path(), name)
        return {'ok': ok, 'error': err}

    def delete_preset(self, name: str) -> dict:
        """Permanently remove ``presets/<name>.txt``."""
        ok, err = profile_module.delete_preset(self.presets_dir, name)
        return {'ok': ok, 'error': err}

    def load_preset(self, name: str) -> dict:
        """Apply a preset (or the reserved 'Default' / 'Vanilla') to the
        active profile. The preset's mod ids are expanded against the current
        installed-mods list so EnableNewMods can never silently re-enable a
        mod the preset wanted disabled."""
        ids = [m['id'] for m in self.list_mods() if not m.get('parent_path')]
        ok, err = profile_module.load_preset(self.presets_dir, self._active_profile_path(), name, ids)
        return {'ok': ok, 'error': err}

    # ── launch ────────────────────────────────────────────────────────────────
    def launch_game(self) -> dict:
        ok, err = launcher_module.launch(self.settings.get('game_path', ''))
        return {'ok': ok, 'error': err}

    # ── meta ──────────────────────────────────────────────────────────────────
    def app_info(self) -> dict[str, Any]:
        import _version
        return {
            'version': _version.__VERSION__,
            'platform': platform.system(),
            'has_game_path': bool(self.settings.get('game_path')),
        }

    # ── internals ─────────────────────────────────────────────────────────────
    def _active_profile_path(self) -> str:
        return paths_module.active_profile_path(self.settings.get('custom_docs_path', ''))

    def _mod_roots(self) -> list[str]:
        custom_docs = self.settings.get('custom_docs_path', '')
        game_path = self.settings.get('game_path', '')
        out: list[str] = []
        for r in (paths_module.documents_mods_root(custom_docs),
                  paths_module.game_mods_root(game_path)):
            if r and os.path.isdir(r):
                out.append(r)
        return out
