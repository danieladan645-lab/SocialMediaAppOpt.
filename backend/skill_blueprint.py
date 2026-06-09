import os

SKILL_PATH = r"C:\Users\danie\Downloads\Claude skills\Powerpoint Creator Claude Skill.md"


def load_skill() -> str:
    with open(SKILL_PATH, "r", encoding="utf-8") as f:
        return f.read()
