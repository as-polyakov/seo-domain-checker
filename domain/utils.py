import logging
from pathlib import Path

import requests
import yaml
from bs4 import BeautifulSoup
from lingua import LanguageDetectorBuilder
import importlib.resources as resources

detector = LanguageDetectorBuilder.from_all_languages().build()

logger = logging.Logger(__name__)


def get_domain_lang(domain: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/117.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }
    response = requests.get(f"https://{domain}", headers=headers)
    lang = response.headers.get("Content-Language")
    soup = BeautifulSoup(response.text, "html.parser")
    # if not lang:
    #     lang = soup.html.get("lang") if soup.html else None
    if not lang:
        html_desc = soup.find("meta", attrs={"name": "description"})
        html_desc = html_desc["content"] if html_desc else None
        if html_desc:
            lang = detector.detect_language_of(html_desc).iso_code_639_1.name.lower()
    if not lang:
        lang = "en"
        logger.info(f"No language found for {domain}, using default {lang}")

    print(f"Domain: {domain}, lang: {lang}")
    return lang


def get_badwords_by_language(lang: str) -> list:
    with resources.files("resources").joinpath("badwords.yaml").open("r") as f:
        badwords_data = yaml.safe_load(f)

    # Return badwords for the specified language, or empty list if not found
    return badwords_data.get(lang.lower(), [])
