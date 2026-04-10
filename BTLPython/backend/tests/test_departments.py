from fastapi.testclient import TestClient


def test_create_and_list_departments(client: TestClient, auth_headers: dict[str, str]):
    create_response = client.post(
        "/api/v1/departments",
        headers=auth_headers,
        json={
            "code": "CNTT",
            "name": "Cong nghe thong tin",
            "description": "Don vi CNTT",
        },
    )
    assert create_response.status_code == 201

    list_response = client.get("/api/v1/departments", headers=auth_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1


def test_delete_department_hard(client: TestClient, auth_headers: dict[str, str]):
    create_response = client.post(
        "/api/v1/departments",
        headers=auth_headers,
        json={
            "code": "VT",
            "name": "Vat tu",
            "description": "Phong vat tu",
        },
    )
    department_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/departments/{department_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    detail_response = client.get(f"/api/v1/departments/{department_id}", headers=auth_headers)
    assert detail_response.status_code == 404
