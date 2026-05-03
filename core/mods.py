"""Minimal mod scanner extracted from the Tk app for the pywebview POC.

Phase 2 will pull more of the original anno117-modmanager.py logic into here
(mod.io, presets, dependency resolution, etc.). For now we only do enough to
populate the Activation tab.
"""
from __future__ import annotations

import json
import os
import platform
import re
from dataclasses import dataclass, field, asdict
from typing import Iterable

IS_WINDOWS = platform.system() == 'Windows'

# Mirrors the language map used by the Tk version so existing modinfo.json
# entries surface in the chosen UI language.
_MODINFO_LANG_MAP = {
    'english': 'English',
    'german': 'German',
    'french': 'French',
    'spanish': 'Spanish',
    'italian': 'Italian',
    'polish': 'Polish',
    'russian': 'Russian',
    'brazilian': 'Portugese',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'simplified_chinese': 'Chinese',
    'traditional_chinese': 'Taiwanese',
}


@dataclass
class Mod:
    id: str
    name: str
    category: str
    version: str
    description: str
    creator: str
    path: str
    parent_path: str = ''
    active: bool = False
    has_options: bool = False
    difficulty: str = 'Normal'
    deps_require: list[str] = field(default_factory=list)
    deps_incompatible: list[str] = field(default_factory=list)


def _strip_jsonc_comments(text: str) -> str:
    """Strips // line and /* block */ comments from a JSONC string."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    text = re.sub(r'(?<!:)//.*', '', text)
    return text


def _localized(value, lang_key: str, default: str = '') -> str:
    if isinstance(value, dict):
        return value.get(lang_key) or value.get('English') or default
    if isinstance(value, str):
        return value
    return default


def _scan_one(path: str, lang_key: str, parent_path: str = '') -> Mod | None:
    if os.path.basename(path).startswith('-'):
        return None
    info_json = os.path.join(path, 'modinfo.json')
    info_jsonc = os.path.join(path, 'modinfo.jsonc')
    target = info_json if os.path.exists(info_json) else (info_jsonc if os.path.exists(info_jsonc) else None)
    if not target:
        return None
    try:
        raw = open(target, 'r', encoding='utf-8').read()
        if target.endswith('.jsonc'):
            raw = _strip_jsonc_comments(raw)
        data = json.loads(raw)
    except (OSError, ValueError):
        return None
    if not isinstance(data, dict):
        return None
    mid = data.get('ModID')
    if not mid:
        return None
    deps = data.get('Dependencies') if isinstance(data.get('Dependencies'), dict) else {}
    return Mod(
        id=str(mid),
        name=_localized(data.get('ModName'), lang_key, default=str(mid)),
        category=_localized(data.get('Category'), lang_key, default=''),
        version=str(data.get('Version', '1.0.0')),
        description=_localized(data.get('Description'), lang_key, default=''),
        creator=str(data.get('CreatorName', '')),
        path=path,
        parent_path=parent_path,
        has_options=bool(data.get('Options')),
        difficulty=str(data.get('Difficulty', 'Normal')),
        deps_require=list(deps.get('Require', []) or []),
        deps_incompatible=list(deps.get('Incompatible', []) or []),
    )


def _proton_documents_root() -> str | None:
    """Find the Anno 117 Documents folder inside any Proton compatdata prefix."""
    home = os.path.expanduser('~')
    compat_roots = [
        os.path.join(home, '.steam', 'steam', 'steamapps', 'compatdata'),
        os.path.join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata'),
    ]
    for root in compat_roots:
        if not os.path.isdir(root):
            continue
        try:
            for appid in os.listdir(root):
                docs = os.path.join(root, appid, 'pfx', 'drive_c', 'users', 'steamuser', 'Documents')
                if os.path.isdir(os.path.join(docs, 'Anno 117 - Pax Romana')):
                    return docs
        except OSError:
            continue
    return None


def documents_mods_root(custom_docs: str = '') -> str:
    """Returns the Anno 117 mods folder inside the user's Documents directory."""
    if custom_docs:
        base = custom_docs
    elif IS_WINDOWS:
        base = os.path.expanduser('~/Documents')
    else:
        base = _proton_documents_root() or os.path.join(os.path.expanduser('~'), 'Documents')
    return os.path.join(base, 'Anno 117 - Pax Romana', 'mods')


def game_mods_root(game_exe_path: str) -> str | None:
    if not game_exe_path:
        return None
    game_root = os.path.dirname(os.path.dirname(os.path.dirname(game_exe_path)))
    candidate = os.path.join(game_root, 'mods')
    return candidate if os.path.isdir(candidate) else None


def list_mods(game_exe_path: str = '', custom_docs: str = '', lang: str = 'english') -> list[dict]:
    """Scan the configured mod roots and return a flat list of mods as plain dicts.

    Each top-level mod folder is parsed once; nested sub-mods become entries with a
    populated ``parent_path``. Folder names starting with '-' are treated as disabled
    (ignored) — same convention the Tk version uses.
    """
    lang_key = _MODINFO_LANG_MAP.get(lang, 'English')
    roots: list[str] = []
    for r in (documents_mods_root(custom_docs), game_mods_root(game_exe_path)):
        if r and os.path.isdir(r) and r not in roots:
            roots.append(r)

    seen_folders: set[str] = set()
    out: list[Mod] = []
    for base in roots:
        try:
            for entry in os.scandir(base):
                if not entry.is_dir() or entry.name.startswith('.') or entry.name.startswith('-'):
                    continue
                if entry.name in seen_folders:
                    continue
                seen_folders.add(entry.name)
                mod = _scan_one(entry.path, lang_key)
                if mod:
                    out.append(mod)
                # Descend into sub-mods (one level)
                try:
                    for sub in os.scandir(entry.path):
                        if sub.is_dir():
                            child = _scan_one(sub.path, lang_key, parent_path=entry.path)
                            if child:
                                out.append(child)
                except OSError:
                    pass
        except OSError:
            continue
    return [asdict(m) for m in out]


def parse_active_profile(active_profile_path: str) -> set[str]:
    """Reads active-profile.txt and returns the set of enabled mod folder names."""
    if not os.path.exists(active_profile_path):
        return set()
    enabled: set[str] = set()
    try:
        for line in open(active_profile_path, 'r', encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # Profile lines list folder names, optionally with arguments
            enabled.add(line.split()[0])
    except OSError:
        pass
    return enabled
