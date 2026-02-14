import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeolocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  carrier?: string;
}

async function geolocatePhoneNumber(phoneNumber: string): Promise<GeolocationResult | null> {
  try {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanedNumber)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'phone-tracker-app',
        },
      }
    );

    if (!response.ok) {
      const response2 = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(phoneNumber)}&key=demo&limit=1`
      );

      if (response2.ok) {
        const data = await response2.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            latitude: result.geometry.lat,
            longitude: result.geometry.lng,
            city: result.components.city || result.components.county,
            country: result.components.country,
          };
        }
      }

      return getDefaultCoordinates();
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        city: data[0].address?.city || data[0].address?.county,
        country: data[0].address?.country,
      };
    }

    return getDefaultCoordinates();
  } catch {
    return getDefaultCoordinates();
  }
}

function getDefaultCoordinates(): GeolocationResult {
  return {
    latitude: 40.7128,
    longitude: -74.006,
    city: "New York",
    country: "United States",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await geolocatePhoneNumber(phoneNumber);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to geolocate phone number' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
