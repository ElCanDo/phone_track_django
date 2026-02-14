# Phone Track Backend (Django + DRF)

This repository now contains a Django backend for tracking phone devices and their location logs.

## Features
- Device CRUD endpoints via Django REST Framework.
- Location log create/list/retrieve endpoints.
- Optional filtering for location logs by `device` query parameter.
- Django admin for managing devices and location data.

## Quick start
1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Apply migrations:
   ```bash
   python manage.py migrate
   ```
4. Run development server:
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
