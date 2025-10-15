from typing import List


def construct_field_or(field: str, conditions: List[str]) -> dict:
    # conditions = conditions[:1]
    if len(conditions) == 0:
        return {}
    return {"or": [
        {"field": field,
         "modifier": "lowercase",
         "is": ["phrase_match", cond]} for cond in conditions]}
