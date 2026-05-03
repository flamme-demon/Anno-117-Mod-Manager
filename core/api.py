"""Python API exposed to JavaScript via pywebview.

Methods on this class are callable from the frontend as
``window.pywebview.api.method_name(...)`` and return Promises in JS.
"""
from __future__ import annotations

import json
import os
import platform
from typing import Any

from . import mods as mods_module

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

        active_profile_path = self._active_profile_path()
        enabled = mods_module.parse_active_profile(active_profile_path) if active_profile_path else set()
        for mod in mods:
            folder = os.path.basename(mod['path'])
            mod['active'] = folder in enabled
        return mods

    def _active_profile_path(self) -> str | None:
        custom_docs = self.settings.get('custom_docs_path', '')
        docs_mods = mods_module.documents_mods_root(custom_docs)
        if not docs_mods:
            return None
        return os.path.join(docs_mods, 'active-profile.txt')

    # ── meta ──────────────────────────────────────────────────────────────────
    def app_info(self) -> dict[str, Any]:
        import _version
        return {
            'version': _version.__VERSION__,
            'platform': platform.system(),
        }
