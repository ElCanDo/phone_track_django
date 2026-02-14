from rest_framework import mixins, viewsets

from tracker.models import Device, LocationLog
from tracker.serializers import DeviceSerializer, LocationLogSerializer


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer


class LocationLogViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LocationLog.objects.select_related("device").all()
    serializer_class = LocationLogSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        device_id = self.request.query_params.get("device")
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        return queryset
