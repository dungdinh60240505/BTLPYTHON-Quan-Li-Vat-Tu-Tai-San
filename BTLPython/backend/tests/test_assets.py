from fastapi.testclient import TestClient


def test_create_and_read_asset(client: TestClient, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS100",
            "name": "Laptop Test",
            "category": "Laptop",
            "status": "available",
            "condition": "good",
        },
    )
    assert response.status_code == 201
    asset_id = response.json()["id"]

    detail_response = client.get(f"/api/v1/assets/{asset_id}", headers=auth_headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["asset_code"] == "TS100"


def test_delete_asset_hard(client: TestClient, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS101",
            "name": "Monitor Test",
            "category": "Monitor",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = response.json()["id"]

    delete_response = client.delete(f"/api/v1/assets/{asset_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    detail_response = client.get(f"/api/v1/assets/{asset_id}", headers=auth_headers)
    assert detail_response.status_code == 404
