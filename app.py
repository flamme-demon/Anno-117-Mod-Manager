"""pywebview entrypoint for the new Anno 117 Mod Manager UI.

Coexists with the legacy Tk entrypoint (anno117-modmanager.py) during the
migration. Once feature parity is reached the Tk entrypoint will be removed.
"""
import os
import sys
import webview

from core.api import Api
import _version


def resource_path(relative_path: str) -> str:
    """Resolve a path that works both in dev and inside a PyInstaller bundle."""
    base = getattr(sys, '_MEIPASS', None) or os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base, relative_path)


def main() -> None:
    api = Api()
    index = resource_path('frontend/index.html')
    webview.create_window(
        title=f'Anno 117 Mod Manager v{_version.__VERSION__}',
        url=index,
        js_api=api,
        width=1440,
        height=900,
        min_size=(1100, 720),
        background_color='#0e1b2e',
    )
    webview.start(debug=os.environ.get('ANNO117_DEBUG') == '1')


if __name__ == '__main__':
    main()
