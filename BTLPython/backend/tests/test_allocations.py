from fastapi.testclient import TestClient


def test_create_asset_allocation(client: TestClient, auth_headers: dict[str, str]):
    department_response = client.post(
        "/api/v1/departments",
        headers=auth_headers,
        json={"code": "KETOAN", "name": "Phong Ke toan", "description": "Tai chinh"},
    )
    department_id = department_response.json()["id"]

    asset_response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS200",
            "name": "Projector Test",
            "category": "Projector",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = asset_response.json()["id"]

    allocation_response = client.post(
        "/api/v1/allocations",
        headers=auth_headers,
        json={
            "allocation_code": "CP001",
            "allocation_type": "asset",
            "asset_id": asset_id,
            "quantity": "1",
            "allocated_department_id": department_id,
        },
    )
    assert allocation_response.status_code == 201
    assert allocation_response.json()["allocation_code"] == "CP001"


def test_delete_allocation_removes_record(client: TestClient, auth_headers: dict[str, str]):
    department_response = client.post(
        "/api/v1/departments",
        headers=auth_headers,
        json={"code": "CNTT", "name": "Phong CNTT", "description": "Cong nghe thong tin"},
    )
    department_id = department_response.json()["id"]

    asset_response = client.post(
        "/api/v1/assets",
        headers=auth_headers,
        json={
            "asset_code": "TS201",
            "name": "Laptop Test Delete",
            "category": "Laptop",
            "status": "available",
            "condition": "good",
        },
    )
    asset_id = asset_response.json()["id"]

    allocation_response = client.post(
        "/api/v1/allocations",
        headers=auth_headers,
        json={
            "allocation_code": "CP002",
            "allocation_type": "asset",
            "asset_id": asset_id,
            "quantity": "1",
            "allocated_department_id": department_id,
        },
    )
    assert allocation_response.status_code == 201
    allocation_id = allocation_response.json()["id"]

    delete_response = client.delete(f"/api/v1/allocations/{allocation_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/allocations/{allocation_id}", headers=auth_headers)
    assert get_response.status_code == 404
