const deviceList = document.getElementById('device-list');
const deviceSelect = document.getElementById('location-device');
const locationList = document.getElementById('location-list');

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(JSON.stringify(payload));
  }
  return response.json();
}

async function loadDevices() {
  const data = await fetchJSON('/api/devices/');
  const devices = data.results ?? data;
  deviceList.innerHTML = '';
  deviceSelect.innerHTML = '';
  devices.forEach((device) => {
    const li = document.createElement('li');
    li.textContent = `${device.name} (${device.owner || 'No owner'})`;
    deviceList.appendChild(li);

    const option = document.createElement('option');
    option.value = device.id;
    option.textContent = device.name;
    deviceSelect.appendChild(option);
  });
}

async function loadLocations() {
  const data = await fetchJSON('/api/locations/');
  const logs = data.results ?? data;
  locationList.innerHTML = '';
  logs.forEach((loc) => {
    const li = document.createElement('li');
    li.textContent = `Device ${loc.device}: (${loc.latitude}, ${loc.longitude}) ±${loc.accuracy_meters}m @ ${loc.captured_at}`;
    locationList.appendChild(li);
  });
}

document.getElementById('device-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  await fetchJSON('/api/devices/', {
    method: 'POST',
    body: JSON.stringify({
      name: document.getElementById('device-name').value,
      owner: document.getElementById('device-owner').value,
    }),
  });
  event.target.reset();
  await loadDevices();
});

document.getElementById('location-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const capturedAt = document.getElementById('captured-at').value;
  await fetchJSON('/api/locations/', {
    method: 'POST',
    body: JSON.stringify({
      device: Number(document.getElementById('location-device').value),
      latitude: Number(document.getElementById('latitude').value),
      longitude: Number(document.getElementById('longitude').value),
      accuracy_meters: Number(document.getElementById('accuracy').value),
      captured_at: new Date(capturedAt).toISOString(),
    }),
  });
  event.target.reset();
  await loadLocations();
});

Promise.all([loadDevices(), loadLocations()]).catch((err) => {
  console.error(err);
  alert('Failed to load tracker data.');
});
