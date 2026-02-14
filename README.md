# Phone Track Backend (Django + DRF)

This repository contains a Django backend for tracking phone devices and their location logs.

## Features
- Device CRUD endpoints via Django REST Framework.
- Location log create/list/retrieve endpoints.
- Validation for latitude, longitude, accuracy, and timestamps.
- Filtering by `device` query parameter for location logs.
- Pagination enabled on list endpoints.
- Django admin for managing devices and location data.

## Quick start
1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set optional environment variables:
   ```bash
   export DJANGO_SECRET_KEY="your-secret"
   export DJANGO_DEBUG="true"
   export DJANGO_ALLOWED_HOSTS="127.0.0.1,localhost"
   ```
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Run development server:
   ```bash
   python manage.py runserver
   ```

## API endpoints
Base path: `/api/`

- `GET, POST /api/devices/`
- `GET, PUT, PATCH, DELETE /api/devices/{id}/`
- `GET, POST /api/locations/`
- `GET /api/locations/{id}/`
- `GET /api/locations/?device={device_id}`

### Query options
- Devices: `?search=<name_or_owner>&ordering=name|-name|created_at|-created_at`
- Locations: `?device=<device_id>&ordering=captured_at|-captured_at`
phone_track
