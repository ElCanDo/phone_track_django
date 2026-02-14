from django.db import models


class Device(models.Model):
    name = models.CharField(max_length=100)
    owner = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class LocationLog(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="locations")
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy_meters = models.FloatField(default=0)
    captured_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]
        indexes = [
            models.Index(fields=["device", "captured_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.device.name}: {self.latitude}, {self.longitude}"
