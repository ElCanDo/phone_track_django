from datetime import timedelta

from django.utils import timezone
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

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def validate_accuracy_meters(self, value):
        if value < 0:
            raise serializers.ValidationError("Accuracy cannot be negative.")
        return value

    def validate_captured_at(self, value):
        if value > timezone.now() + timedelta(minutes=5):
            raise serializers.ValidationError("captured_at cannot be far in the future.")
        return value
