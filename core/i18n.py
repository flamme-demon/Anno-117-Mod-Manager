"""Locale detection + the supported-languages catalogue.

Language keys mirror what the in-game ``texts_<lang>.xml`` files use so the
loca loader doesn't need a translation table on top.
"""
from __future__ import annotations

import locale as _locale
from dataclasses import dataclass


@dataclass(frozen=True)
class Language:
    key: str        # internal key matching texts_<key>.xml
    name: str       # native display name
    flag: str       # Unicode regional-indicator pair (renders as a flag glyph)


# Order roughly matches in-game language picker / mod.io's footer.
LANGUAGES: tuple[Language, ...] = (
    Language('english',             'English',              '🇬🇧'),
    Language('german',              'Deutsch',              '🇩🇪'),
    Language('french',              'Français',             '🇫🇷'),
    Language('spanish',             'Español',              '🇪🇸'),
    Language('italian',             'Italiano',             '🇮🇹'),
    Language('polish',              'Polski',               '🇵🇱'),
    Language('russian',             'Русский',              '🇷🇺'),
    Language('brazilian',           'Português (Brasil)',   '🇧🇷'),
    Language('japanese',            '日本語',                '🇯🇵'),
    Language('korean',              '한국어',                '🇰🇷'),
    Language('simplified_chinese',  '简体中文',              '🇨🇳'),
    Language('traditional_chinese', '繁體中文',              '🇹🇼'),
)

# locale prefix → key mapping. Full locale (e.g. zh_TW) is tried first, then
# the prefix (e.g. zh) for cases where only the language is known.
_LOCALE_MAP: dict[str, str] = {
    'pt': 'brazilian', 'pt_br': 'brazilian',
    'en': 'english',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    'ja': 'japanese',
    'ko': 'korean',
    'pl': 'polish',
    'ru': 'russian',
    'zh': 'simplified_chinese',
    'zh_cn': 'simplified_chinese',
    'es': 'spanish',
    'zh_tw': 'traditional_chinese',
}


def detect_system_lang() -> str:
    """Best-effort guess at the system language. Always returns a valid key
    from LANGUAGES; falls back to 'english' when locale info is missing."""
    try:
        loc = _locale.getlocale()[0] or 'en'
        code = loc.lower().replace('-', '_')
        if code in _LOCALE_MAP:
            return _LOCALE_MAP[code]
        prefix = code.split('_', 1)[0]
        if prefix in _LOCALE_MAP:
            return _LOCALE_MAP[prefix]
    except Exception:
        pass
    return 'english'


def language_for(key: str) -> Language:
    """Return the Language entry for a key, or the English fallback."""
    for lang in LANGUAGES:
        if lang.key == key:
            return lang
    return LANGUAGES[0]


def is_known(key: str) -> bool:
    return any(l.key == key for l in LANGUAGES)
