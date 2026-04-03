from __future__ import annotations

from dataclasses import dataclass
from fnmatch import fnmatchcase
from typing import Dict, List
from urllib.parse import urlparse

import requests


DEFAULT_USER_AGENT = "ZaytoonzScraperBot/1.0"
_ROBOTS_CACHE: Dict[str, "RobotsRules"] = {}


@dataclass
class RobotsRules:
    host_key: str
    robots_url: str
    disallow_patterns: List[str]
    allow_patterns: List[str]
    fetched: bool
    error: str | None = None


def _normalize_pattern(pattern: str) -> str:
    p = (pattern or "").strip()
    if not p:
        return ""
    if not p.startswith("/"):
        p = "/" + p
    return p


def _extract_group(lines: List[str], user_agent: str) -> Dict[str, List[str]]:
    ua_lower = (user_agent or "*").strip().lower()
    groups: List[Dict[str, List[str]]] = []
    current_agents: List[str] = []
    current_rules = {"allow": [], "disallow": []}

    for raw_line in lines:
        line = raw_line.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip().lower()
        value = value.strip()

        if key == "user-agent":
            # New group starts if we already collected rules for previous agents.
            if current_agents and (current_rules["allow"] or current_rules["disallow"]):
                groups.append({"agents": current_agents, **current_rules})
                current_agents = []
                current_rules = {"allow": [], "disallow": []}
            current_agents.append(value.lower())
            continue

        if key in ("allow", "disallow"):
            current_rules[key].append(value)

    if current_agents:
        groups.append({"agents": current_agents, **current_rules})

    # Prefer exact UA group first; fallback to wildcard group.
    exact = next((g for g in groups if ua_lower in g["agents"]), None)
    if exact:
        return {"allow": exact["allow"], "disallow": exact["disallow"]}

    wildcard = next((g for g in groups if "*" in g["agents"]), None)
    if wildcard:
        return {"allow": wildcard["allow"], "disallow": wildcard["disallow"]}

    return {"allow": [], "disallow": []}


def get_robots_rules(url: str, user_agent: str = DEFAULT_USER_AGENT) -> RobotsRules:
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError(f"Invalid URL: {url}")

    host_key = f"{parsed.scheme}://{parsed.netloc}".lower()
    if host_key in _ROBOTS_CACHE:
        return _ROBOTS_CACHE[host_key]

    robots_url = f"{host_key}/robots.txt"
    try:
        resp = requests.get(robots_url, timeout=10)
        if resp.status_code >= 400:
            # If robots is missing/unreachable, fail-open but report fetch status.
            rules = RobotsRules(
                host_key=host_key,
                robots_url=robots_url,
                disallow_patterns=[],
                allow_patterns=[],
                fetched=False,
                error=f"robots.txt returned {resp.status_code}",
            )
        else:
            lines = resp.text.splitlines()
            group = _extract_group(lines, user_agent=user_agent)
            rules = RobotsRules(
                host_key=host_key,
                robots_url=robots_url,
                disallow_patterns=[_normalize_pattern(p) for p in group["disallow"] if p.strip()],
                allow_patterns=[_normalize_pattern(p) for p in group["allow"] if p.strip()],
                fetched=True,
                error=None,
            )
    except Exception as exc:
        rules = RobotsRules(
            host_key=host_key,
            robots_url=robots_url,
            disallow_patterns=[],
            allow_patterns=[],
            fetched=False,
            error=str(exc),
        )

    _ROBOTS_CACHE[host_key] = rules
    return rules


def _matches(pattern: str, path: str) -> bool:
    if not pattern:
        return False
    # Support robots wildcard style.
    if "*" in pattern or "$" in pattern:
        wildcard = pattern.replace("$", "")
        if pattern.endswith("$"):
            return fnmatchcase(path, wildcard) and path.endswith(wildcard.rstrip("*"))
        return fnmatchcase(path, wildcard)
    return path.startswith(pattern)


def check_url_allowed(url: str, user_agent: str = DEFAULT_USER_AGENT) -> Dict[str, object]:
    parsed = urlparse(url)
    path = parsed.path or "/"
    if parsed.query:
        path = f"{path}?{parsed.query}"

    rules = get_robots_rules(url, user_agent=user_agent)

    matched_allow = [p for p in rules.allow_patterns if _matches(p, path)]
    matched_disallow = [p for p in rules.disallow_patterns if _matches(p, path)]

    # Longest match precedence, allow wins ties.
    best_allow = max(matched_allow, key=len) if matched_allow else None
    best_disallow = max(matched_disallow, key=len) if matched_disallow else None

    allowed = True
    matched_rule = None
    if best_disallow:
        allowed = not (len(best_disallow) > len(best_allow or ""))
        matched_rule = best_allow if not allowed and best_allow else best_disallow

    return {
        "url": url,
        "path": path,
        "allowed": allowed,
        "matched_rule": matched_rule,
        "robots_url": rules.robots_url,
        "robots_fetched": rules.fetched,
        "robots_error": rules.error,
    }
