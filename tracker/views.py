from rest_framework import filters, mixins, viewsets

from tracker.models import Device, LocationLog
from tracker.serializers import DeviceSerializer, LocationLogSerializer


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "owner"]
    ordering_fields = ["name", "created_at"]
    ordering = ["-created_at"]


class LocationLogViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LocationLog.objects.select_related("device").all()
    serializer_class = LocationLogSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["captured_at", "created_at"]
    ordering = ["-captured_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        device_id = self.request.query_params.get("device")
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        return queryset
