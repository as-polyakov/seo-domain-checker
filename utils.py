"""
Utils module - re-exports all functions from domain.utils for easier imports
"""
from domain.utils import (
    url_to_domain,
    get_disallowed_words_by_lang_fallback,
    _safe_int,
    _safe_float,
    detector,
    logger
)

