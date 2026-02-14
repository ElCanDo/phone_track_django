from rest_framework import serializers

from tracker.models import Device, LocationLog


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ["id", "name", "owner", "created_at"]
        read_only_fields = ["id", "created_at"]


class LocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationLog
        fields = [
            "id",
            "device",
            "latitude",
            "longitude",
            "accuracy_meters",
            "captured_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
