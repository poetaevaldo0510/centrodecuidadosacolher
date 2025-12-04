import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Loader2 } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Using Open-Meteo API (free, no key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      
      const data = await response.json();
      
      const weatherCode = data.current.weather_code;
      let condition = 'Ensolarado';
      if (weatherCode >= 51 && weatherCode <= 67) condition = 'Chuvoso';
      else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Neve';
      else if (weatherCode >= 80 && weatherCode <= 99) condition = 'Tempestade';
      else if (weatherCode >= 1 && weatherCode <= 3) condition = 'Nublado';

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
      });
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      // Default weather
      setWeather({
        temp: 24,
        condition: 'Ensolarado',
        humidity: 65,
        windSpeed: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun size={32} />;
    if (weather.condition === 'Chuvoso' || weather.condition === 'Tempestade') 
      return <CloudRain size={32} className="text-blue-500" />;
    if (weather.condition === 'Nublado') 
      return <Cloud size={32} className="text-gray-400" />;
    return <Sun size={32} className="text-warning" />;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 p-4 rounded-2xl border border-blue-200/50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  const getOutingSuggestion = () => {
    if (!weather) return '';
    if (weather.condition === 'Chuvoso' || weather.condition === 'Tempestade') 
      return '🏠 Dia ideal para atividades em casa';
    if (weather.temp > 30) 
      return '🏊 Bom dia para atividades com água';
    if (weather.temp < 18) 
      return '🧥 Lembre de agasalhar bem a criança';
    return '🌳 Ótimo dia para passeio ao ar livre!';
  };

  return (
    <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 p-4 rounded-2xl border border-blue-200/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">Clima Agora</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-blue-900 dark:text-blue-50">{weather?.temp}°</span>
            <span className="text-sm text-blue-700 dark:text-blue-200">{weather?.condition}</span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-blue-700 dark:text-blue-200">
            <span className="flex items-center gap-1">
              <Wind size={12} /> {weather?.windSpeed} km/h
            </span>
            <span>💧 {weather?.humidity}%</span>
          </div>
        </div>
        <div className="text-blue-600 dark:text-blue-300">
          {getWeatherIcon()}
        </div>
      </div>
      <p className="mt-3 text-xs text-blue-800 dark:text-blue-200 font-medium bg-blue-500/10 px-3 py-2 rounded-xl">
        {getOutingSuggestion()}
      </p>
    </div>
  );
};

export default WeatherWidget;
