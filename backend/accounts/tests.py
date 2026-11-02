from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AuthApiTests(APITestCase):
    def register(self, **overrides):
        data = {"username": "alice", "email": "alice@example.com", "password": "S3cure-pass!"}
        data.update(overrides)
        return self.client.post("/api/auth/register/", data, format="json")

    def test_register_returns_token(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["username"], "alice")
        self.assertNotIn("password", response.data["user"])

    def test_register_rejects_weak_password(self):
        response = self.register(password="12345678")
        self.assertEqual(response.status_code, 400)

    def test_register_rejects_duplicate_email(self):
        self.register()
        response = self.register(username="bob")
        self.assertEqual(response.status_code, 400)

    def test_login_and_me(self):
        self.register()
        login = self.client.post("/api/auth/login/", {"username": "alice", "password": "S3cure-pass!"}, format="json")
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + login.data["token"])
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["username"], "alice")

    def test_login_with_wrong_password_fails(self):
        self.register()
        response = self.client.post("/api/auth/login/", {"username": "alice", "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_logout_invalidates_token(self):
        token = self.register().data["token"]
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_logout_requires_login(self):
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 401)
