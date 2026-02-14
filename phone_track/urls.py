from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tracker.views import DeviceViewSet, LocationLogViewSet

router = DefaultRouter()
router.register("devices", DeviceViewSet, basename="device")
router.register("locations", LocationLogViewSet, basename="location")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
