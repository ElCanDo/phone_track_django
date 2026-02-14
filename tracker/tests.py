from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from tracker.models import Device, LocationLog


class TrackerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_device(self):
        response = self.client.post("/api/devices/", {"name": "Pixel", "owner": "Alice"}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Device.objects.count(), 1)

    def test_filter_locations_by_device(self):
        device_a = Device.objects.create(name="iPhone")
        device_b = Device.objects.create(name="Galaxy")
        now = timezone.now()
        LocationLog.objects.create(
            device=device_a,
            latitude=12.120000,
            longitude=77.120000,
            accuracy_meters=5,
            captured_at=now,
        )
        LocationLog.objects.create(
            device=device_b,
            latitude=13.120000,
            longitude=78.120000,
            accuracy_meters=3,
            captured_at=now - timedelta(minutes=5),
        )

        response = self.client.get(f"/api/locations/?device={device_a.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["device"], device_a.id)

    def test_reject_invalid_coordinates(self):
        device = Device.objects.create(name="Nexus")
        response = self.client.post(
            "/api/locations/",
            {
                "device": device.id,
                "latitude": 93,
                "longitude": 45,
                "accuracy_meters": 2,
                "captured_at": timezone.now().isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("latitude", response.data)

    def test_reject_negative_accuracy(self):
        device = Device.objects.create(name="OnePlus")
        response = self.client.post(
            "/api/locations/",
            {
                "device": device.id,
                "latitude": 43,
                "longitude": 45,
                "accuracy_meters": -1,
                "captured_at": timezone.now().isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("accuracy_meters", response.data)
