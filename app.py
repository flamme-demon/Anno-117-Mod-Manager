"""pywebview entrypoint for the new Anno 117 Mod Manager UI.

Coexists with the legacy Tk entrypoint (anno117-modmanager.py) during the
migration. Once feature parity is reached the Tk entrypoint will be removed.
"""
import json
import os
import platform
import sys
import threading

import webview
from webview.dom import DOMEventHandler

from core.api import Api
import _version


def resource_path(relative_path: str) -> str:
    """Resolve a path that works both in dev and inside a PyInstaller bundle."""
    base = getattr(sys, '_MEIPASS', None) or os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base, relative_path)


def main() -> None:
    api = Api()
    index = resource_path('frontend/index.html')
    window = webview.create_window(
        title=f'Anno 117 Mod Manager v{_version.__VERSION__}',
        url=index,
        js_api=api,
        width=1440,
        height=900,
        min_size=(1100, 720),
        background_color='#0e1b2e',
    )
    # Attach the window so the API can open native file dialogs.
    api.window = window

    # WebKit2GTK strips dataTransfer payloads from JS drop events for
    # security, leaving us with empty files/items lists no matter what we
    # try in JavaScript. pywebview's DOM event bridge bypasses this by
    # surfacing the event from the Python side, with the file's absolute
    # path injected as ``pywebviewFullPath``. So we route ALL drag-drop
    # through Python: register dragenter/dragover/drop on the document, and
    # let Python install the ZIP and notify the JS UI via evaluate_js.
    def _noop(_e):
        pass

    def _on_native_drop(e):
        files = (e or {}).get('dataTransfer', {}).get('files', []) or []

        # WebKit2GTK 2.50+ sanitises dataTransfer.files to an empty list
        # before pywebview can enrich it with pywebviewFullPath. Pull the
        # paths straight from pywebview's GTK-side cache — populated by
        # WebView's 'drag-data-received' signal in webview/platforms/gtk.py.
        if not files:
            try:
                from webview.dom import _dnd_state  # private but stable
                if _dnd_state.get('paths'):
                    files = [{'name': bn, 'pywebviewFullPath': fp}
                             for bn, fp in _dnd_state['paths']]
                    _dnd_state['paths'].clear()
            except Exception as exc:
                print(f'[native-drop] could not read _dnd_state: {exc!r}')

        zip_path = next(
            (f.get('pywebviewFullPath') for f in files
             if isinstance(f, dict) and (f.get('pywebviewFullPath') or '').lower().endswith('.zip')),
            None,
        )
        if not zip_path:
            window.evaluate_js(
                'annoRoot().onNativeDropResult({ok:false, error:"not a zip file"}, "")'
            )
            return
        display = json.dumps(os.path.basename(zip_path))
        path_js = json.dumps(zip_path)
        window.evaluate_js(f'annoRoot().onNativeDropStart({display})')
        result = api.install_zip_from_path(zip_path, allow_overwrite=False)
        window.evaluate_js(f'annoRoot().onNativeDropResult({json.dumps(result)}, {path_js})')

    _bound = {'done': False}

    def _bind_dom():
        if _bound['done']:
            return
        _bound['done'] = True
        # 1. Standard pywebview DOM hook — works on Windows (WebView2) and
        #    macOS (Cocoa) where dataTransfer.files is preserved.
        try:
            window.dom.document.events.dragenter += DOMEventHandler(_noop, True, False)
            window.dom.document.events.dragover  += DOMEventHandler(_noop, True, False, debounce=200)
            window.dom.document.events.drop      += DOMEventHandler(_on_native_drop, True, True)
        except Exception as exc:
            print(f'[bind] FAILED to register DOM handlers: {exc!r}')

        # 2. Linux-only fallback — WebKit2GTK 2.50+ sanitises the JS drop
        #    event so dataTransfer.files is always empty AND the standard
        #    pywebview pywebviewFullPath enrichment never gets called. Hook
        #    the GTK widget's 'drag-data-received' signal directly to
        #    intercept dropped file paths BEFORE WebKit consumes them, and
        #    drive install_zip_from_path from Python.
        if platform.system() == 'Linux':
            _wire_gtk_dnd_bridge(window)

    window.events.loaded += _bind_dom
    webview.start(debug=os.environ.get('ANNO117_DEBUG') == '1')


def _wire_gtk_dnd_bridge(window) -> None:
    """Linux/GTK fallback for drag-and-drop file installs.

    Connects a private handler to the WebKit GTK widget's drag-data-received
    signal. The signal fires with the URI list of the dragged files BEFORE
    WebKit has a chance to sanitise the JS drop event. We install the first
    .zip we find and notify the frontend via evaluate_js.
    """
    try:
        from webview.platforms.gtk import BrowserView  # type: ignore[import-not-found]
    except Exception as exc:
        print(f'[gtk-dnd] cannot import GTK platform module: {exc!r}')
        return

    bv = BrowserView.instances.get(window.uid)
    if not bv or not getattr(bv, 'webview', None):
        print('[gtk-dnd] no GTK BrowserView found for this window')
        return

    api = window._js_api  # the Api instance we passed to create_window

    def _on_gtk_drag_data(_widget, _ctx, _x, _y, data, _info, _time):
        # The signal fires on the GTK main thread; ZIP extraction blocks for
        # several hundred ms which freezes the UI. Read the URIs synchronously
        # (we have to — `data` is only valid inside this callback) then hand
        # the install off to a worker thread.
        uris = list(data.get_uris() or [])
        if not uris:
            text = data.get_text() or ''
            uris = [line.strip() for line in text.splitlines() if line.strip()]
        threading.Thread(
            target=_process_dropped_uris,
            args=(window, api, uris),
            daemon=True,
        ).start()

    # pywebview connects to 'drag-data-received' but never calls
    # drag_dest_set on the WebView widget, so GTK has no drop target
    # registered and the signal stays silent. Register text/uri-list
    # explicitly so the signal actually fires when a file is dropped.
    try:
        from gi.repository import Gtk, Gdk  # type: ignore[import-not-found]
        target = Gtk.TargetEntry.new('text/uri-list', 0, 0)
        bv.webview.drag_dest_set(
            Gtk.DestDefaults.ALL,
            [target],
            Gdk.DragAction.COPY,
        )
        print('[gtk-dnd] drag_dest_set OK')
    except Exception as exc:
        print(f'[gtk-dnd] drag_dest_set failed: {exc!r}')

    bv.webview.connect('drag-data-received', _on_gtk_drag_data)
    print('[gtk-dnd] bridge connected')


def _process_dropped_uris(window, api, uris: list) -> None:
    """Runs in a worker thread so the GTK main loop stays responsive while
    we extract the ZIP. ``uris`` is the URI list captured synchronously from
    the GTK drag-data-received callback."""
    try:
        zip_uri = next((u for u in uris if u.lower().endswith('.zip')), None)
        if not zip_uri:
            _notify_drop_result(window, {'ok': False, 'error': 'no .zip in drop'}, '')
            return
        from urllib.parse import urlparse, unquote
        parsed = urlparse(zip_uri)
        zip_path = unquote(parsed.path) if parsed.scheme == 'file' else unquote(zip_uri)
        display = json.dumps(os.path.basename(zip_path))
        try:
            window.evaluate_js(f'annoRoot().onNativeDropStart({display})')
        except Exception:
            pass
        result = api.install_zip_from_path(zip_path, allow_overwrite=False)
        _notify_drop_result(window, result, zip_path)
    except Exception as exc:
        print(f'[gtk-dnd] worker crashed: {exc!r}')
        _notify_drop_result(window, {'ok': False, 'error': str(exc)}, '')


def _notify_drop_result(window, result: dict, path: str) -> None:
    payload = json.dumps(result)
    path_js = json.dumps(path)
    try:
        window.evaluate_js(f'annoRoot().onNativeDropResult({payload}, {path_js})')
    except Exception as exc:
        print(f'[gtk-dnd] evaluate_js failed: {exc!r}')


if __name__ == '__main__':
    main()
