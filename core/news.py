"""News-feed aggregators for the News tab.

Each fetch_* function returns a list of news-item dicts in the shape:

    {
      'title':       str,
      'url':         str,           # opens in the user's external browser
      'date':        str,           # 'Mar 14, 2026' style for display
      'sort_ts':     float,         # unix timestamp for the merged sort
      'excerpt':     str,           # short plain-text summary
      'img_url':     str | None,    # remote thumbnail
      'source':      str,           # 'anno_union' | 'reddit'
      'badge_text':  str,           # short uppercase label, eg 'ANNO UNION'
      'badge_color': str,           # CSS hex for the source pill
    }

Fetches are best-effort: any exception → empty list (logged to stderr) so a
broken source never blocks the others.
"""
from __future__ import annotations

import html
import re
import sys
from datetime import datetime
from typing import Callable

import requests

_UA = 'Mozilla/5.0 (X11; Linux x86_64) Anno117ModManager/1.0'


def _fmt_date(ts: float) -> str:
    try:
        return datetime.fromtimestamp(ts).strftime('%b %d, %Y')
    except Exception:
        return ''


def _strip_html(raw: str, max_len: int = 160) -> str:
    text = html.unescape(re.sub(r'<[^<]+?>', '', raw or '').strip())
    return (text[:max_len] + '...') if len(text) > max_len else text


def fetch_anno_union(timeout: float = 10.0) -> list[dict]:
    """Pull the 10 latest blog posts from anno-union.com via its WordPress
    REST API. Featured-media thumbnails are extracted from the embedded data
    when available."""
    items: list[dict] = []
    try:
        url = 'https://www.anno-union.com/wp-json/wp/v2/posts?_embed&per_page=10'
        res = requests.get(url, headers={'User-Agent': _UA, 'Accept': 'application/json'},
                           timeout=timeout)
        res.raise_for_status()
        for post in res.json():
            try:
                dt = datetime.strptime(post.get('date', ''), '%Y-%m-%dT%H:%M:%S')
                sort_ts = dt.timestamp()
                date_text = dt.strftime('%b %d, %Y')
            except Exception:
                sort_ts = 0.0
                date_text = post.get('date', '')

            img_url = None
            try:
                media = (post.get('_embedded') or {}).get('wp:featuredmedia', [{}])[0]
                img_url = ((media.get('media_details') or {}).get('sizes', {})
                                .get('medium', {}).get('source_url')
                           or media.get('source_url'))
            except Exception:
                pass

            items.append({
                'title':       html.unescape((post.get('title') or {}).get('rendered', 'Unknown')),
                'url':         post.get('link', 'https://www.anno-union.com/en/blogs/'),
                'date':        date_text,
                'sort_ts':     sort_ts,
                'excerpt':     _strip_html((post.get('excerpt') or {}).get('rendered', '')),
                'img_url':     img_url,
                'source':      'anno_union',
                'badge_text':  'ANNO UNION',
                'badge_color': '#5f022e',
            })
    except Exception as e:
        print(f'[news] anno_union fetch failed: {e}', file=sys.stderr)
    return items


def fetch_reddit(timeout: float = 10.0) -> list[dict]:
    """Pull the 10 latest /r/anno posts via Reddit's public JSON endpoint."""
    items: list[dict] = []
    try:
        url = 'https://www.reddit.com/r/anno/new.json?limit=10'
        res = requests.get(url, headers={'User-Agent': _UA}, timeout=timeout)
        res.raise_for_status()
        for child in (res.json().get('data') or {}).get('children', []):
            d = child.get('data') or {}
            ts = float(d.get('created_utc') or 0.0)
            img_url = None
            preview = (d.get('preview') or {}).get('images', [])
            if preview and preview[0].get('source', {}).get('url'):
                img_url = html.unescape(preview[0]['source']['url'])
            items.append({
                'title':       d.get('title', 'Untitled'),
                'url':         f'https://www.reddit.com{d.get("permalink", "")}',
                'date':        _fmt_date(ts),
                'sort_ts':     ts,
                'excerpt':     _strip_html(d.get('selftext') or ''),
                'img_url':     img_url,
                'source':      'reddit',
                'badge_text':  'r/anno',
                'badge_color': '#ff4500',
            })
    except Exception as e:
        print(f'[news] reddit fetch failed: {e}', file=sys.stderr)
    return items


def fetch_all(include_reddit: bool, parallel: bool = True) -> list[dict]:
    """Pull every enabled source (in parallel by default) and return one
    chronologically-sorted list."""
    workers: list[Callable[[], list[dict]]] = [fetch_anno_union]
    if include_reddit:
        workers.append(fetch_reddit)

    if not parallel or len(workers) == 1:
        out: list[dict] = []
        for w in workers:
            out += w()
    else:
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=len(workers)) as pool:
            out = []
            for items in pool.map(lambda fn: fn(), workers):
                out += items

    out.sort(key=lambda x: x.get('sort_ts', 0.0), reverse=True)
    return out
