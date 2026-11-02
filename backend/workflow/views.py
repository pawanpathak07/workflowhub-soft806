
from rest_framework import viewsets

from .models import WorkflowItem
from .serializers import WorkflowItemSerializer


class WorkflowItemViewSet(viewsets.ModelViewSet):
    """Create, list, retrieve, update (PUT/PATCH) and delete the signed-in user's workflow items."""

    serializer_class = WorkflowItemSerializer

    def get_queryset(self):
        # Users can only ever see and change their own items.
        queryset = WorkflowItem.objects.filter(owner=self.request.user)
        status = self.request.query_params.get("status")
        if status in WorkflowItem.Status.values:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
