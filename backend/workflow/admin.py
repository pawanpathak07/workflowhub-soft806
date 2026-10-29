from django.contrib import admin

from .models import WorkflowItem


@admin.register(WorkflowItem)
class WorkflowItemAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "status", "priority", "due_date", "created_at")
    list_filter = ("status", "priority")
    search_fields = ("title", "description")
