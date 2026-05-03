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
import tempfile
from typing import Any

from . import files as files_module
from . import i18n as i18n_module
from . import installer as installer_module
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
        # Set by app.py once the window exists; needed for create_file_dialog.
        self.window: Any = None

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

    def _save_settings(self) -> tuple[bool, str]:
        """Persist self.settings to disk. Returns (ok, error)."""
        try:
            os.makedirs(self.appdata, exist_ok=True)
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(self.settings, f, indent=4, ensure_ascii=False)
            return True, ''
        except OSError as e:
            return False, str(e)

    def update_setting(self, key: str, value: Any) -> dict:
        """Update a single key in settings.json (used for small toggles like
        selected_language). For more complex updates use the dedicated
        endpoints (toggle_mod, save_preset, etc.)."""
        # Whitelist what JS can write so a stray bridge call can't pollute
        # arbitrary keys (game_path stays managed by browse_game_path etc.).
        allowed = {
            'selected_language', 'jump_to_activation', 'show_tooltips',
            'show_reddit_news', 'use_mod_browser', 'enable_new_mods',
            'mod_location_mode', 'modio_api_key', 'modio_declined',
        }
        if key not in allowed:
            return {'ok': False, 'error': f'setting not writable from UI: {key}'}
        self.settings[key] = value
        ok, err = self._save_settings()
        return {'ok': ok, 'error': err}

    # ── settings (paths) ──────────────────────────────────────────────────────
    def pick_folder(self, title: str = '') -> str:
        """Open the OS native folder picker. Returns the chosen path or ''
        if cancelled. The pywebview window must be set first (app.py wires it)."""
        if not self.window:
            return ''
        try:
            import webview
            result = self.window.create_file_dialog(
                webview.FOLDER_DIALOG,
                directory=os.path.expanduser('~'),
                allow_multiple=False,
            )
        except Exception:
            return ''
        if not result:
            return ''
        return result[0] if isinstance(result, (list, tuple)) else str(result)

    def pick_file(self, title: str = '', file_types: list[str] | None = None) -> str:
        """Open the OS native file picker. ``file_types`` is a list of
        pywebview filter strings like 'Anno executable (*.exe)'."""
        if not self.window:
            return ''
        try:
            import webview
            result = self.window.create_file_dialog(
                webview.OPEN_DIALOG,
                directory=os.path.expanduser('~'),
                allow_multiple=False,
                file_types=tuple(file_types or ()),
            )
        except Exception:
            return ''
        if not result:
            return ''
        return result[0] if isinstance(result, (list, tuple)) else str(result)

    def set_game_path(self, path: str) -> dict:
        """Validate that the path points at Anno117.exe (or a folder containing
        it) and persist it to settings.json. Returns {ok, path, error}."""
        if not path:
            return {'ok': False, 'error': 'empty path'}
        candidate = os.path.realpath(path)
        # If it's a directory, look for the exe inside it
        if os.path.isdir(candidate):
            for sub in (
                os.path.join(candidate, 'Bin', 'Win64', 'Anno117.exe'),
                os.path.join(candidate, 'Anno 117 - Pax Romana', 'Bin', 'Win64', 'Anno117.exe'),
                os.path.join(candidate, 'Anno117.exe'),
            ):
                if os.path.isfile(sub):
                    candidate = sub
                    break
            else:
                return {'ok': False, 'error': 'no Anno117.exe found inside that folder'}
        if not os.path.isfile(candidate) or not candidate.lower().endswith('anno117.exe'):
            return {'ok': False, 'error': 'not a valid Anno117.exe path'}
        self.settings['game_path'] = candidate
        ok, err = self._save_settings()
        return {'ok': ok, 'path': candidate, 'error': err}

    def detect_game_path(self) -> dict:
        """Run the cross-platform find_anno_exe and persist the result."""
        found = paths_module.find_anno_exe()
        if not found:
            return {'ok': False, 'error': 'Anno117.exe not found on this machine'}
        return self.set_game_path(found)

    def set_custom_docs_path(self, path: str) -> dict:
        """Persist (or clear if empty) the override for the Anno 117 documents
        folder. The override should point at the directory that *contains*
        ``Anno 117 - Pax Romana``."""
        if not path:
            self.settings['custom_docs_path'] = ''
            ok, err = self._save_settings()
            return {'ok': ok, 'path': '', 'error': err}
        path = os.path.realpath(path)
        if not os.path.isdir(path):
            return {'ok': False, 'error': 'path is not a directory'}
        self.settings['custom_docs_path'] = path
        ok, err = self._save_settings()
        return {'ok': ok, 'path': path, 'error': err}

    def get_paths_info(self) -> dict:
        """Return everything the Settings tab needs to display: configured
        paths, whether they exist, the resolved mods + active-profile paths."""
        game = self.settings.get('game_path', '')
        docs = self.settings.get('custom_docs_path', '')
        return {
            'game_path': game,
            'game_path_exists': bool(game) and os.path.isfile(game),
            'custom_docs_path': docs,
            'custom_docs_path_exists': bool(docs) and os.path.isdir(docs),
            'documents_mods_root': paths_module.documents_mods_root(docs),
            'game_mods_root': paths_module.game_mods_root(game),
            'active_profile_path': self._active_profile_path(),
            'appdata_dir': self.appdata,
            'presets_dir': self.presets_dir,
        }

    # ── i18n ──────────────────────────────────────────────────────────────────
    def get_languages(self) -> list[dict]:
        """Return all supported languages with their key, native name, flag."""
        return [
            {'key': l.key, 'name': l.name, 'flag': l.flag}
            for l in i18n_module.LANGUAGES
        ]

    def detect_language(self) -> str:
        """Best-effort guess at the system language. Returns a key."""
        return i18n_module.detect_system_lang()

    def get_language(self) -> str:
        """Return the currently selected language key (or detected one if
        nothing is saved yet)."""
        saved = self.settings.get('selected_language')
        if saved and i18n_module.is_known(saved):
            return saved
        return i18n_module.detect_system_lang()

    def set_language(self, key: str) -> dict:
        """Persist the user's language choice to settings.json."""
        if not i18n_module.is_known(key):
            return {'ok': False, 'error': f'unknown language: {key}'}
        return self.update_setting('selected_language', key)

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

    # ── manual install ────────────────────────────────────────────────────────
    def install_zip_from_path(self, zip_path: str, allow_overwrite: bool = False) -> dict:
        """Install a mod from a ZIP file already on disk (e.g. picked via the
        native file dialog). Returns the installer's result dict augmented
        with target info."""
        target = self._mod_install_target()
        if not target:
            return {'ok': False, 'error': 'no mods folder configured'}
        return installer_module.install_zip(zip_path, target, allow_overwrite=allow_overwrite)

    def install_zip_from_b64(self, filename: str, b64: str, allow_overwrite: bool = False) -> dict:
        """Install a mod from an in-memory ZIP (used for HTML5 drag-drop:
        the JS reads the dropped File as base64 and posts it here). The
        payload is decoded into a temp file then the regular install path is
        re-used. Capped at 200 MB."""
        if not b64:
            return {'ok': False, 'error': 'empty payload'}
        try:
            raw = base64.b64decode(b64, validate=True)
        except Exception as e:
            return {'ok': False, 'error': f'bad base64: {e}'}
        if len(raw) > 200 * 1024 * 1024:
            return {'ok': False, 'error': 'archive too large (>200 MB)'}
        target = self._mod_install_target()
        if not target:
            return {'ok': False, 'error': 'no mods folder configured'}
        # Sanitise the filename — only used for the temp file's extension
        safe_name = (filename or 'upload.zip').replace('/', '_').replace('\\', '_')
        if not safe_name.lower().endswith('.zip'):
            safe_name += '.zip'
        try:
            with tempfile.NamedTemporaryFile(prefix='_modupload_', suffix='_' + safe_name,
                                             delete=False) as tf:
                tf.write(raw)
                tmp_path = tf.name
        except OSError as e:
            return {'ok': False, 'error': f'cannot stash upload: {e}'}
        try:
            return installer_module.install_zip(tmp_path, target, allow_overwrite=allow_overwrite)
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    def _mod_install_target(self) -> str:
        """Where new mods land (Documents folder takes precedence over the
        game-side folder, mirroring the Tk version's mod_loc_mode default)."""
        custom_docs = self.settings.get('custom_docs_path', '')
        mode = self.settings.get('mod_location_mode', 'Documents')
        if mode == 'GameDirectory':
            return paths_module.game_mods_root(self.settings.get('game_path', '')) \
                or paths_module.documents_mods_root(custom_docs)
        return paths_module.documents_mods_root(custom_docs) \
            or paths_module.game_mods_root(self.settings.get('game_path', ''))

    # ── modloader log ─────────────────────────────────────────────────────────
    def read_modloader_log(self) -> dict:
        """Read mod-loader.log from the documents mods folder. Returns
        ``{ok, content, path, exists}``. Capped at ~2 MB so a runaway log
        can't make the bridge call hang."""
        custom_docs = self.settings.get('custom_docs_path', '')
        docs_mods = paths_module.documents_mods_root(custom_docs)
        path = os.path.join(docs_mods, 'mod-loader.log') if docs_mods else ''
        if not path:
            return {'ok': False, 'path': '', 'exists': False, 'error': 'no documents folder'}
        if not os.path.exists(path):
            return {'ok': True, 'path': path, 'exists': False, 'content': ''}
        try:
            size = os.path.getsize(path)
            cap = 2 * 1024 * 1024
            with open(path, 'r', encoding='utf-8', errors='replace') as f:
                if size > cap:
                    f.seek(size - cap)
                    f.readline()  # discard the partial first line
                content = f.read()
            return {'ok': True, 'path': path, 'exists': True, 'content': content,
                    'truncated': size > cap}
        except OSError as e:
            return {'ok': False, 'path': path, 'exists': True, 'error': str(e)}

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
