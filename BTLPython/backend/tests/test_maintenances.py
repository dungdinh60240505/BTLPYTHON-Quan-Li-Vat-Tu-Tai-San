from fastapi.testclient import TestClient


def test_create_maintenance(client: TestClient, auth_headers: dict[str, str]):
    asset_response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS300",
            "name": "May in test",
            "category": "Printer",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = asset_response.json()["id"]

    maintenance_response = client.post(
        "/api/v1/maintenances",
        headers=auth_headers,
        json={
            "maintenance_code": "BT001",
            "asset_id": asset_id,
            "maintenance_type": "corrective",
            "status": "scheduled",
            "priority": "medium",
            "title": "Bao tri may in",
        },
    )
    assert maintenance_response.status_code == 201
    assert maintenance_response.json()["maintenance_code"] == "BT001"


def test_upload_and_delete_maintenance_attachment(client: TestClient, auth_headers: dict[str, str]):
    asset_response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS301",
            "name": "May scan test",
            "category": "Scanner",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = asset_response.json()["id"]

    maintenance_response = client.post(
        "/api/v1/maintenances",
        headers=auth_headers,
        json={
            "maintenance_code": "BT002",
            "asset_id": asset_id,
            "maintenance_type": "corrective",
            "status": "scheduled",
            "priority": "medium",
            "title": "Bao tri may scan",
        },
    )
    maintenance_id = maintenance_response.json()["id"]

    upload_response = client.post(
        f"/api/v1/maintenances/{maintenance_id}/attachment",
        headers=auth_headers,
        files={"attachment": ("bien-ban.pdf", b"%PDF-1.4 test file", "application/pdf")},
    )
    assert upload_response.status_code == 200
    assert upload_response.json()["attachment_original_name"] == "bien-ban.pdf"
    assert upload_response.json()["attachment_mime_type"] == "application/pdf"
    assert upload_response.json()["attachment_url"].startswith("/uploads/maintenances/")
    assert upload_response.json()["attachment_size"] > 0

    delete_response = client.delete(
        f"/api/v1/maintenances/{maintenance_id}/attachment",
        headers=auth_headers,
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["attachment_original_name"] is None
    assert delete_response.json()["attachment_stored_name"] is None
    assert delete_response.json()["attachment_url"] is None
    assert delete_response.json()["attachment_mime_type"] is None
    assert delete_response.json()["attachment_size"] is None


def test_delete_maintenance_hard(client: TestClient, auth_headers: dict[str, str]):
    asset_response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS302",
            "name": "May chieu test",
            "category": "Projector",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = asset_response.json()["id"]

    maintenance_response = client.post(
        "/api/v1/maintenances",
        headers=auth_headers,
        json={
            "maintenance_code": "BT003",
            "asset_id": asset_id,
            "maintenance_type": "corrective",
            "status": "scheduled",
            "priority": "medium",
            "title": "Bao tri may chieu",
        },
    )
    maintenance_id = maintenance_response.json()["id"]

    delete_response = client.delete(f"/api/v1/maintenances/{maintenance_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    detail_response = client.get(f"/api/v1/maintenances/{maintenance_id}", headers=auth_headers)
    assert detail_response.status_code == 404
