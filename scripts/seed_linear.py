#!/usr/bin/env python3
"""Seed Linear with the demo backlog for "The Intern".

Creates exactly five issues against a single team using the Linear GraphQL API.
Labels are resolved by name (and created on the team if missing) so the issues
end up tagged the way the demo expects.

Environment:
    LINEAR_API_KEY   A Linear personal API key.
    LINEAR_TEAM_ID   The target team's UUID (Settings -> API, or the team query).

Usage:
    python scripts/seed_linear.py
"""
from __future__ import annotations

import os
import sys

import requests

LINEAR_API_URL = "https://api.linear.app/graphql"

# A small palette so freshly-created labels aren't all the same grey.
LABEL_COLORS = {
    "intern-safe": "#4cb782",
    "needs-human-review": "#f2c94c",
    "frontend": "#5e6ad2",
    "backend": "#26b5ce",
    "bug": "#eb5757",
    "tests": "#bb87fc",
}
DEFAULT_LABEL_COLOR = "#95a2b3"

ISSUES = [
    {
        "title": "Kanban board crashes when task list is large",
        "description": "The board loads all tasks at once with no limit. Need to handle this.",
        "estimate": 1,
        "labels": ["intern-safe", "frontend"],
    },
    {
        "title": "Empty task titles should be rejected",
        "description": (
            "Users can submit a task with no title. The API should reject it "
            "and the UI should surface the error."
        ),
        "estimate": 1,
        "labels": ["intern-safe", "backend", "frontend"],
    },
    {
        "title": "Deleting a missing task throws a server error",
        "description": "Reported by QA. Happens when a task is deleted twice or the ID is stale.",
        "estimate": 1,
        "labels": ["intern-safe", "bug", "backend"],
    },
    {
        "title": "Add tests for delete edge cases",
        "description": "Delete endpoint is untested for failure scenarios.",
        "estimate": 1,
        "labels": ["intern-safe", "tests"],
    },
    {
        "title": "Add priority to tasks",
        "description": "Product wants low/medium/high priority on each task. Needs schema changes.",
        "estimate": 3,
        "labels": ["needs-human-review", "backend"],
    },
]


class LinearClient:
    def __init__(self, api_key: str, team_id: str) -> None:
        self.team_id = team_id
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": api_key,
                "Content-Type": "application/json",
            }
        )

    def _gql(self, query: str, variables: dict) -> dict:
        resp = self.session.post(
            LINEAR_API_URL,
            json={"query": query, "variables": variables},
            timeout=30,
        )
        resp.raise_for_status()
        payload = resp.json()
        if "errors" in payload:
            raise RuntimeError(f"Linear API error: {payload['errors']}")
        return payload["data"]

    def get_team_labels(self) -> dict[str, str]:
        """Return a {label_name: label_id} map for the team's labels."""
        query = """
        query TeamLabels($teamId: String!) {
          team(id: $teamId) {
            labels(first: 250) {
              nodes { id name }
            }
          }
        }
        """
        data = self._gql(query, {"teamId": self.team_id})
        nodes = data["team"]["labels"]["nodes"]
        return {n["name"]: n["id"] for n in nodes}

    def create_label(self, name: str) -> str:
        query = """
        mutation CreateLabel($input: IssueLabelCreateInput!) {
          issueLabelCreate(input: $input) {
            success
            issueLabel { id name }
          }
        }
        """
        variables = {
            "input": {
                "name": name,
                "teamId": self.team_id,
                "color": LABEL_COLORS.get(name, DEFAULT_LABEL_COLOR),
            }
        }
        data = self._gql(query, variables)
        result = data["issueLabelCreate"]
        if not result["success"]:
            raise RuntimeError(f"Failed to create label {name!r}")
        return result["issueLabel"]["id"]

    def resolve_label_ids(self, names: list[str], cache: dict[str, str]) -> list[str]:
        ids: list[str] = []
        for name in names:
            if name not in cache:
                cache[name] = self.create_label(name)
            ids.append(cache[name])
        return ids

    def create_issue(
        self, title: str, description: str, estimate: int, label_ids: list[str]
    ) -> dict:
        query = """
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier url title }
          }
        }
        """
        variables = {
            "input": {
                "teamId": self.team_id,
                "title": title,
                "description": description,
                "estimate": estimate,
                "labelIds": label_ids,
            }
        }
        data = self._gql(query, variables)
        result = data["issueCreate"]
        if not result["success"]:
            raise RuntimeError(f"Failed to create issue {title!r}")
        return result["issue"]


def main() -> int:
    api_key = os.environ.get("LINEAR_API_KEY")
    team_id = os.environ.get("LINEAR_TEAM_ID")
    if not api_key or not team_id:
        print(
            "ERROR: set LINEAR_API_KEY and LINEAR_TEAM_ID environment variables.",
            file=sys.stderr,
        )
        return 1

    client = LinearClient(api_key, team_id)

    print("Loading existing team labels...")
    label_cache = client.get_team_labels()

    created: list[dict] = []
    for spec in ISSUES:
        label_ids = client.resolve_label_ids(spec["labels"], label_cache)
        issue = client.create_issue(
            title=spec["title"],
            description=spec["description"],
            estimate=spec["estimate"],
            label_ids=label_ids,
        )
        created.append({**issue, "labels": spec["labels"]})
        print(f"Created {issue['identifier']}: {issue['title']}")
        print(f"  ID:  {issue['id']}")
        print(f"  URL: {issue['url']}")

    print("\nSummary")
    print("=" * 88)
    print(f"{'Identifier':<12} {'Title':<48} {'Labels'}")
    print("-" * 88)
    for issue in created:
        title = issue["title"]
        if len(title) > 46:
            title = title[:45] + "\u2026"
        print(f"{issue['identifier']:<12} {title:<48} {', '.join(issue['labels'])}")
    print("=" * 88)
    print(f"Created {len(created)} issues.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
