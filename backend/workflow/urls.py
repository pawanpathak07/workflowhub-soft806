from rest_framework.routers import DefaultRouter

from .views import WorkflowItemViewSet

router = DefaultRouter()
router.register("items", WorkflowItemViewSet, basename="item")

urlpatterns = router.urls
