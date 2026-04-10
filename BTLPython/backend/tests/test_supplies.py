from fastapi.testclient import TestClient


def test_create_and_update_supply_stock(client: TestClient, auth_headers: dict[str, str]):
    create_response = client.post(
        "/api/v1/supplies",
        headers=auth_headers,
        json={
            "supply_code": "VT100",
            "name": "Giay A4",
            "category": "Van phong pham",
            "unit": "ream",
            "quantity_in_stock": "5",
            "minimum_stock_level": "2",
        },
    )
    assert create_response.status_code == 201
    supply_id = create_response.json()["id"]

    stock_response = client.patch(
        f"/api/v1/supplies/{supply_id}/stock",
        headers=auth_headers,
        json={"quantity_change": "3", "note": "Nhap them"},
    )
    assert stock_response.status_code == 200
    assert stock_response.json()["quantity_in_stock"] == "8.00"


def test_delete_supply_hard(client: TestClient, auth_headers: dict[str, str]):
    create_response = client.post(
        "/api/v1/supplies",
        headers=auth_headers,
        json={
            "supply_code": "VT101",
            "name": "But bi",
            "category": "Van phong pham",
            "unit": "cay",
            "quantity_in_stock": "10",
            "minimum_stock_level": "2",
        },
    )
    supply_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/supplies/{supply_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    detail_response = client.get(f"/api/v1/supplies/{supply_id}", headers=auth_headers)
    assert detail_response.status_code == 404
