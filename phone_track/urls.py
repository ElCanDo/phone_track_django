from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tracker.frontend_views import TrackerFrontendView
from tracker.views import DeviceViewSet, LocationLogViewSet

router = DefaultRouter()
router.register("devices", DeviceViewSet, basename="device")
router.register("locations", LocationLogViewSet, basename="location")

urlpatterns = [
    path("", TrackerFrontendView.as_view(), name="tracker-frontend"),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
