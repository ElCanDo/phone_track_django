from django.contrib import admin

from tracker.models import Device, LocationLog


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "created_at")
    search_fields = ("name", "owner")


@admin.register(LocationLog)
class LocationLogAdmin(admin.ModelAdmin):
    list_display = ("id", "device", "latitude", "longitude", "captured_at")
    list_filter = ("captured_at",)
