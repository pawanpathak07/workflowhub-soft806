
from rest_framework import serializers

from .models import WorkflowItem


class WorkflowItemSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=120)

    class Meta:
        model = WorkflowItem
        fields = ("id", "title", "description", "status", "priority", "due_date", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be blank.")
        return value
