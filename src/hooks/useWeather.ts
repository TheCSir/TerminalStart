import { useState, useEffect, useCallback } from 'react';
import { WeatherData, processWeatherData } from '@/utils/weatherUtils';

const fetchIpLocation = async (): Promise<{ lat: number; lon: number; city?: string } | null> => {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await res.json();
    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { lat, lon, city: data.city };
    }
  } catch (e) { /* ignore */ }
  return null;
};

export const useWeather = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number, options: { defaultCity?: string, showError?: boolean } = {}) => {
    const { defaultCity, showError = true } = options;

    try {
      // Parallelize requests
      const geoPromise = (async () => {
        let resolvedCity = defaultCity || "Unknown";
        if (!defaultCity) {
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const geoData = await geoRes.json();
            if (geoData.city) resolvedCity = geoData.city;
            else if (geoData.locality) resolvedCity = geoData.locality;
          } catch (e) { /* ignore */ }
        }
        return resolvedCity;
      })();

      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,visibility&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
      );

      const [city, response] = await Promise.all([geoPromise, weatherPromise]);

      if (!response.ok) throw new Error('API Error');

      const result = await response.json();

      // Use the new helper function
      const newData = processWeatherData(city, result);

      setData(newData);
      setLoading(false);
      setError(null);

      // Update Cache
      localStorage.setItem('tui-weather-cache', JSON.stringify(newData));

    } catch (err) {
      console.error(err);
      if (showError) {
        setError("fetch failed");
        setLoading(false);
      }
    }
  }, []);

  const fallbackToIp = useCallback(async (showError: boolean) => {
    const ipLoc = await fetchIpLocation();
    if (ipLoc) {
      fetchWeather(ipLoc.lat, ipLoc.lon, { defaultCity: ipLoc.city, showError });
    } else if (showError) {
      setError("loc error");
      setLoading(false);
    }
  }, [fetchWeather]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      fallbackToIp(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude, { showError: true });
      },
      () => {
        // Geolocation denied or failed, fall back to IP-based location
        fallbackToIp(true);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
    );
  }, [fetchWeather, fallbackToIp]);

  useEffect(() => {
    // 1. Try to load from cache
    const cached = localStorage.getItem('tui-weather-cache');
    let hasCache = false;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setData(parsed);
          setLoading(false);
          hasCache = true;
        }
      } catch (e) {
        console.error("Weather cache parse error", e);
      }
    }

    if (!navigator.geolocation) {
      fallbackToIp(!hasCache);
      return;
    }

    // Delay fetch if we have cache, otherwise fetch immediately
    const delay = hasCache ? 1000 : 0;

    const timer = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, { showError: !hasCache });
        },
        () => {
          // Geolocation denied or failed, fall back to IP-based location
          fallbackToIp(!hasCache);
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [fetchWeather, fallbackToIp]);

  return { data, loading, error, refetch };
};
