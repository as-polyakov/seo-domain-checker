from typing import List


def construct_or(field: str, conditions: List[str]) -> dict:
    # conditions = conditions[:1]
    return {"or": [
        {"field": field,
         "modifier": "lowercase",
         "is": ["phrase_match", cond]} for cond in conditions]}
