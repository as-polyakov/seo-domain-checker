import logging
from typing import Dict, Any, Optional
from urllib.parse import urlparse

import urllib3
from lingua import LanguageDetectorBuilder

detector = LanguageDetectorBuilder.from_all_languages().build()
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.Logger(__name__)

def url_to_domain(url: str) -> str:
    url = url.strip().strip("'\"")  # remove stray quotes
    if "://" not in url:
        url = "https://" + url  # add dummy scheme so urlparse works
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path
    return domain.rstrip('/')


def get_disallowed_words_by_lang_fallback(disallowed_words_by_lang: Dict[str, Dict[str, Any]], lang: str) -> Dict[str, Any]:
    fallback_language = "en"
    l = lang
    if lang not in disallowed_words_by_lang:
        print(f"Warning, no disallowed words found for lang {lang}, using fallback language {fallback_language}")
        l = fallback_language
    return disallowed_words_by_lang[l]


def _safe_int(value) -> Optional[int]:
    return int(value) if value else None


def _safe_float(value) -> Optional[float]:
    return float(value) if value else None