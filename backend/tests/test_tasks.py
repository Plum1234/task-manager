"""Happy-path tests for the task endpoints.

Coverage gaps left on purpose:
  - No test for invalid input on POST (e.g. empty title).
  - No test for deleting a nonexistent task.
"""
from __future__ import annotations


def _create(client, title="Write demo script", description="for the intern"):
    resp = client.post("/tasks", json={"title": title, "description": description})
    assert resp.status_code == 201
    return resp.json()


def test_create_task(client):
    data = _create(client)
    assert data["id"] > 0
    assert data["title"] == "Write demo script"
    assert data["status"] == "todo"
    assert data["created_at"]


def test_list_tasks(client):
    _create(client, title="One")
    _create(client, title="Two")
    resp = client.get("/tasks")
    assert resp.status_code == 200
    titles = [t["title"] for t in resp.json()]
    assert "One" in titles and "Two" in titles


def test_get_task(client):
    created = _create(client)
    resp = client.get(f"/tasks/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_update_task(client):
    created = _create(client)
    resp = client.put(
        f"/tasks/{created['id']}",
        json={"status": "in_progress", "title": "Updated"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "in_progress"
    assert body["title"] == "Updated"


def test_delete_task(client):
    created = _create(client)
    resp = client.delete(f"/tasks/{created['id']}")
    assert resp.status_code == 204
    # And it's really gone.
    assert client.get(f"/tasks/{created['id']}").status_code == 404
