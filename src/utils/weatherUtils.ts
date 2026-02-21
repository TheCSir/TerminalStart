export type TempUnit = 'C' | 'F';

/**
 * Converts temperature from Fahrenheit to the specified unit.
 * @param tempF Temperature in Fahrenheit
 * @param unit Unit to convert to ('C' or 'F')
 * @returns Converted temperature
 */
export const convertTemp = (tempF: number, unit: TempUnit): number => {
  if (unit === 'F') return tempF;
  return Math.round((tempF - 32) * 5 / 9);
};

// Map WMO Weather Codes to text conditions
export const getWeatherCondition = (code: number, isDay: number = 1): string => {
  if (code === 0) return isDay ? 'Sunny' : 'Clear Sky';
  if (code === 1) return isDay ? 'Mainly Sunny' : 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code === 56 || code === 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code === 66 || code === 67) return 'Freezing Rain';
  if (code >= 71 && code <= 75) return 'Snow';
  if (code === 77) return 'Snow Grains';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code === 85 || code === 86) return 'Snow Showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm with Hail';
  return 'Unknown';
};

export interface WeatherData {
  locationName?: string;
  current: {
    temp: number;
    condition: string;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    precipProb: number;
    precipAmt: number;
    visKm: number;
    isDay: number; // 1 for day, 0 for night
  };
  forecast: {
    time: string;
    temp: number;
    condition: string;
    weatherCode?: number;
    isDay?: number;
  }[];
}

export const processWeatherData = (city: string, result: any, now: Date = new Date()): WeatherData => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const currentHourIso = `${year}-${month}-${day}T${hour}`;

  let hourIndex = 0;
  // Check if result.hourly.time exists and is an array
  if (result.hourly && Array.isArray(result.hourly.time)) {
    const resultTimeIndex = result.hourly.time.findIndex((t: string) => t.startsWith(currentHourIso));
    if (resultTimeIndex !== -1) hourIndex = resultTimeIndex;
  }

  // Parse Current
  const currentData = {
    temp: Math.round(result.current.temperature_2m),
    condition: getWeatherCondition(result.current.weather_code, result.current.is_day),
    weatherCode: result.current.weather_code,
    humidity: result.current.relative_humidity_2m,
    windSpeed: Math.round(result.current.wind_speed_10m),
    feelsLike: Math.round(result.current.apparent_temperature),
    precipProb: result.hourly?.precipitation_probability ? (result.hourly.precipitation_probability[hourIndex] || 0) : 0,
    precipAmt: result.current.precipitation,
    visKm: (result.current.visibility || 0) / 1000,
    isDay: result.current.is_day
  };

  // Standard Forecast - Get next 3 hours
  let standardForecast: WeatherData['forecast'] = [];
  if (result.hourly && result.hourly.time) {
    const nextHours = result.hourly.time.slice(hourIndex + 1, hourIndex + 4);

    standardForecast = nextHours.map((_: string, i: number) => {
      const actualIndex = hourIndex + 1 + i;
      const safeIndex = Math.min(actualIndex, result.hourly.temperature_2m.length - 1);

      const dateObj = new Date(result.hourly.time[safeIndex]);
      const hours = dateObj.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const hours12 = hours % 12 || 12;
      const displayTime = `${hours12} ${ampm}`;
      const isDayForecast = (hours >= 6 && hours < 20) ? 1 : 0; // Rough estimate

      return {
        time: displayTime.padStart(5, ' '),
        temp: Math.round(result.hourly.temperature_2m[safeIndex]),
        condition: getWeatherCondition(result.hourly.weather_code[safeIndex], isDayForecast),
        weatherCode: result.hourly.weather_code[safeIndex],
        isDay: isDayForecast
      };
    });
  }

  return {
    locationName: city,
    current: currentData,
    forecast: standardForecast
  };
};
