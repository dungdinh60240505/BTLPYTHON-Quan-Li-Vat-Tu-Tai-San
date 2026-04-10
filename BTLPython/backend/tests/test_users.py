from fastapi.testclient import TestClient


def test_create_and_list_users(client: TestClient, auth_headers: dict[str, str]):
    department_response = client.post(
        "/api/v1/departments",
        headers=auth_headers,
        json={"code": "PDT", "name": "Phong Dao tao", "description": "Hoc vu"},
    )
    department_id = department_response.json()["id"]

    user_response = client.post(
        "/api/v1/users",
        headers=auth_headers,
        json={
            "username": "manager01",
            "email": "manager01@test.local",
            "full_name": "Manager 01",
            "password": "Password@123",
            "confirm_password": "Password@123",
            "role": "manager",
            "department_id": department_id,
        },
    )
    assert user_response.status_code == 201

    list_response = client.get("/api/v1/users", headers=auth_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1


def test_delete_user_hard(client: TestClient, auth_headers: dict[str, str]):
    user_response = client.post(
        "/api/v1/users",
        headers=auth_headers,
        json={
            "username": "staff02",
            "email": "staff02@test.local",
            "full_name": "Staff 02",
            "password": "Password@123",
            "confirm_password": "Password@123",
            "role": "staff",
        },
    )
    user_id = user_response.json()["id"]

    delete_response = client.delete(f"/api/v1/users/{user_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    detail_response = client.get(f"/api/v1/users/{user_id}", headers=auth_headers)
    assert detail_response.status_code == 404
