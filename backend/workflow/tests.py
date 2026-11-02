from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import WorkflowItem

User = get_user_model()


class WorkflowItemApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "S3cure-pass!")
        self.other = User.objects.create_user("bob", "bob@example.com", "S3cure-pass!")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)

    def test_requires_authentication(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/api/items/").status_code, 401)

    def test_create_item_defaults_to_pending(self):
        response = self.client.post("/api/items/", {"title": "Write report", "description": "Task 1"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(WorkflowItem.objects.get().owner, self.user)

    def test_blank_title_is_rejected(self):
        response = self.client.post("/api/items/", {"title": "   "}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_list_only_returns_own_items(self):
        WorkflowItem.objects.create(owner=self.user, title="Mine")
        WorkflowItem.objects.create(owner=self.other, title="Theirs")
        response = self.client.get("/api/items/")
        self.assertEqual([i["title"] for i in response.data], ["Mine"])

    def test_filter_by_status(self):
        WorkflowItem.objects.create(owner=self.user, title="A", status="pending")
        WorkflowItem.objects.create(owner=self.user, title="B", status="completed")
        response = self.client.get("/api/items/?status=completed")
        self.assertEqual([i["title"] for i in response.data], ["B"])

    def test_update_status_and_edit(self):
        item = WorkflowItem.objects.create(owner=self.user, title="Draft")
        response = self.client.patch(f"/api/items/{item.id}/", {"status": "in_progress"}, format="json")
        self.assertEqual(response.status_code, 200)
        response = self.client.put(
            f"/api/items/{item.id}/", {"title": "Final", "description": "d", "status": "completed"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual((item.title, item.status), ("Final", "completed"))

    def test_invalid_status_is_rejected(self):
        item = WorkflowItem.objects.create(owner=self.user, title="Draft")
        response = self.client.patch(f"/api/items/{item.id}/", {"status": "done"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_delete_item(self):
        item = WorkflowItem.objects.create(owner=self.user, title="Old")
        self.assertEqual(self.client.delete(f"/api/items/{item.id}/").status_code, 204)
        self.assertFalse(WorkflowItem.objects.exists())

    def test_cannot_touch_another_users_item(self):
        item = WorkflowItem.objects.create(owner=self.other, title="Private")
        self.assertEqual(self.client.get(f"/api/items/{item.id}/").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/items/{item.id}/").status_code, 404)


class PriorityAndDueDateTests(APITestCase):
    def setUp(self):
        user = User.objects.create_user("alice", "alice@example.com", "S3cure-pass!")
        self.client.credentials(HTTP_AUTHORIZATION="Token " + Token.objects.create(user=user).key)

    def test_priority_defaults_to_medium_and_due_date_is_optional(self):
        response = self.client.post("/api/items/", {"title": "Plan sprint"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["priority"], "medium")
        self.assertIsNone(response.data["due_date"])

    def test_create_with_priority_and_due_date(self):
        response = self.client.post(
            "/api/items/", {"title": "Ship release", "priority": "high", "due_date": "2026-11-06"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual((response.data["priority"], response.data["due_date"]), ("high", "2026-11-06"))

    def test_invalid_priority_and_date_are_rejected(self):
        self.assertEqual(self.client.post("/api/items/", {"title": "x", "priority": "urgent"}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/items/", {"title": "x", "due_date": "not-a-date"}, format="json").status_code, 400)


class HealthTests(APITestCase):
    def test_health_endpoint_is_public(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
