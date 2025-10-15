from importlib import resources as resources
from typing import List, Dict, Any

import yaml
from enum import Enum

class ForbiddenWordCategory(str, Enum):
    FORBIDDEN = "forbidden"
    SPAM = "spam"

def get_disallowed_words() -> Dict[str, Dict[str, Any]]:
    with resources.files("resources").joinpath("disallowed_words.yaml").open("r") as f:
        disallowed_words_data = yaml.safe_load(f)

    return disallowed_words_data
