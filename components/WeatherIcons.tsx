import React from 'react';

// --- WEATHER ICONS v2.0 MAPPING ---
// Maps WMO codes to Weather Icons class names
// Doc ref: https://erikflowers.github.io/weather-icons/

const getIconClass = (code: number, isDay: boolean): string => {
  // prefix and neutral are not needed since we return full strings
  // const prefix = isDay ? 'wi-day-' : 'wi-night-alt-'; 
  // const neutral = 'wi-';

  switch (code) {
    case 0: return isDay ? 'wi-day-sunny' : 'wi-night-clear';
    case 1: return isDay ? 'wi-day-sunny-overcast' : 'wi-night-alt-partly-cloudy';
    case 2: return isDay ? 'wi-day-cloudy' : 'wi-night-alt-cloudy';
    case 3: return 'wi-cloudy';

    case 45: return isDay ? 'wi-day-fog' : 'wi-night-fog';
    case 48: return isDay ? 'wi-day-fog' : 'wi-night-fog'; // Depositing rime fog

    case 51: return isDay ? 'wi-day-sprinkle' : 'wi-night-alt-sprinkle';
    case 53: return isDay ? 'wi-day-sprinkle' : 'wi-night-alt-sprinkle';
    case 55: return isDay ? 'wi-day-sprinkle' : 'wi-night-alt-sprinkle';

    case 56: return isDay ? 'wi-day-sleet' : 'wi-night-alt-sleet'; // Freezing drizzle
    case 57: return isDay ? 'wi-day-sleet' : 'wi-night-alt-sleet';

    case 61: return isDay ? 'wi-day-showers' : 'wi-night-alt-showers'; // Rain slight
    case 63: return isDay ? 'wi-day-rain' : 'wi-night-alt-rain';       // Rain moderate
    case 65: return isDay ? 'wi-day-rain' : 'wi-night-alt-rain';       // Rain heavy

    case 66: return isDay ? 'wi-day-rain-mix' : 'wi-night-alt-rain-mix'; // Freezing rain
    case 67: return isDay ? 'wi-day-rain-mix' : 'wi-night-alt-rain-mix';

    case 71: return isDay ? 'wi-day-snow' : 'wi-night-alt-snow'; // Snow slight
    case 73: return isDay ? 'wi-day-snow' : 'wi-night-alt-snow'; // Snow moderate
    case 75: return isDay ? 'wi-day-snow' : 'wi-night-alt-snow'; // Snow heavy
    case 77: return isDay ? 'wi-day-hail' : 'wi-night-alt-hail'; // Snow grains

    case 80: return isDay ? 'wi-day-showers' : 'wi-night-alt-showers';
    case 81: return isDay ? 'wi-day-showers' : 'wi-night-alt-showers';
    case 82: return isDay ? 'wi-day-showers' : 'wi-night-alt-showers';

    case 85: return isDay ? 'wi-day-snow' : 'wi-night-alt-snow'; // Snow showers
    case 86: return isDay ? 'wi-day-snow' : 'wi-night-alt-snow';

    case 95: return isDay ? 'wi-day-thunderstorm' : 'wi-night-alt-thunderstorm';
    case 96: return isDay ? 'wi-day-storm-showers' : 'wi-night-alt-storm-showers'; // Thunderstorm + slight hail
    case 99: return isDay ? 'wi-day-storm-showers' : 'wi-night-alt-storm-showers'; // Thunderstorm + heavy hail



    default: return 'wi-na';
  }
};


// --- COMPONENT ---

interface WeatherIconProps {
  code: number;
  isDay: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isDay }) => {
  const iconClass = getIconClass(code, isDay === 1);

  return (
    <div className="h-full w-full flex items-center justify-center transition-all duration-300">
      <i className={`wi ${iconClass}`}></i>
    </div>
  );
};
