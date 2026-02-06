import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  RefreshCw,
  MapPin,
  Wheat,
  Shield,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { OPENWEATHER_API_KEY } from "@/lib/env";

// ---------------------- Custom UI Components ----------------------
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-bold text-gray-900 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
);

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "outline"; className?: string }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "bg-green-100 text-green-800 hover:bg-green-200",
    outline: "text-foreground border border-gray-200 hover:bg-gray-50",
  };
  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    outline: "border border-green-600 bg-transparent hover:bg-green-50 text-green-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Alert = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
);

// ---------------------- Interfaces ----------------------
interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  visibility: number;
  name: string;
  country?: string;
}

interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: { main: string; description: string; icon: string }[];
    dt_txt: string;
    rain?: { "3h": number };
  }[];
}

interface AdvisoryWeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  rainfall: number;
  condition: string;
  icon: string;
  uv: number;
}

interface WeatherRecommendation {
  type: 'warning' | 'success' | 'info';
  icon: JSX.Element;
  title: string;
  message: string;
  crops: string[];
}

// ---------------------- Agriculture Advisory ----------------------
const AgricultureAdvisory = ({ weatherData }: { weatherData: AdvisoryWeatherData }) => {
  const getCropRecommendations = () => {
    const { temperature, humidity, rainfall, condition } = weatherData;
    const recommendations: WeatherRecommendation[] = [];

    if (temperature > 35) {
      recommendations.push({
        type: "warning",
        icon: <Thermometer className="w-4 h-4 text-orange-500" />,
        title: "High Temperature Alert",
        message:
          "Ensure adequate irrigation. Consider shade nets for sensitive crops. Harvest early morning or evening.",
        crops: ["Tomatoes", "Leafy Greens", "Peppers"],
      });
    } else if (temperature < 10) {
      recommendations.push({
        type: "warning",
        icon: <Shield className="w-4 h-4 text-blue-500" />,
        title: "Cold Weather Protection",
        message:
          "Protect crops from frost. Use row covers or greenhouse protection for sensitive plants.",
        crops: ["Citrus", "Tropical Fruits", "Tender Vegetables"],
      });
    } else {
      recommendations.push({
        type: "success",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        title: "Optimal Temperature",
        message:
          "Good conditions for most crop activities including planting and harvesting.",
        crops: ["Wheat", "Rice", "Corn", "Vegetables"],
      });
    }

    if (humidity > 80) {
      recommendations.push({
        type: "warning",
        icon: <Droplets className="w-4 h-4 text-blue-500" />,
        title: "High Humidity Warning",
        message:
          "Increased risk of fungal diseases. Ensure good air circulation and consider fungicide application.",
        crops: ["All crops - Disease monitoring required"],
      });
    } else if (humidity < 30) {
      recommendations.push({
        type: "info",
        icon: <Sun className="w-4 h-4 text-orange-500" />,
        title: "Low Humidity",
        message:
          "Increase irrigation frequency. Consider misting for greenhouse crops.",
        crops: ["Leafy Greens", "Herbs", "Greenhouse Crops"],
      });
    }

    if (rainfall > 10) {
      recommendations.push({
        type: "info",
        icon: <Droplets className="w-4 h-4 text-blue-500" />,
        title: "Heavy Rainfall",
        message:
          "Ensure proper drainage. Delay pesticide applications. Check for waterlogging.",
        crops: ["All crops - Drainage important"],
      });
    } else if (rainfall === 0 && condition.toLowerCase() === "clear") {
      recommendations.push({
        type: "info",
        icon: <Wheat className="w-4 h-4 text-yellow-500" />,
        title: "Dry Conditions",
        message:
          "Good for harvesting and field preparation. Maintain irrigation schedules.",
        crops: ["Grains", "Fruits ready for harvest"],
      });
    }

    return recommendations;
  };

  const getSeasonalAdvice = () => {
    const month = new Date().getMonth();
    const { temperature } = weatherData;

    if (month >= 2 && month <= 5 && temperature > 25) {
      return {
        season: "Summer Season",
        crops: ["Cotton", "Sugarcane", "Rice", "Vegetables", "Fodder crops"],
        activities: ["Irrigation management", "Pest monitoring", "Mulching"],
      };
    } else if (month >= 9 && month <= 11) {
      return {
        season: "Winter Season",
        crops: ["Wheat", "Barley", "Mustard", "Gram", "Peas"],
        activities: ["Sowing", "Land preparation", "Fertilizer application"],
      };
    }

    return {
      season: "Current Season",
      crops: ["Mixed cultivation based on local conditions"],
      activities: ["Regular monitoring", "Irrigation as needed", "Pest control"],
    };
  };

  const recommendations = getCropRecommendations();
  const seasonalAdvice = getSeasonalAdvice();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wheat className="w-5 h-5 text-green-600" />
            <span>Agricultural Advisory</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <Alert
              key={index}
              className={`${rec.type === "warning"
                ? "border-yellow-200 bg-yellow-50/50"
                : rec.type === "success"
                  ? "border-green-200 bg-green-50/50"
                  : "border-blue-200 bg-blue-50/50"
                }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">{rec.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 text-sm ${rec.type === 'warning' ? 'text-yellow-800' : rec.type === 'success' ? 'text-green-800' : 'text-blue-800'}`}>
                    {rec.title}
                  </h4>
                  <AlertDescription className="text-gray-600">{rec.message}</AlertDescription>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rec.crops.map((crop: string, cropIndex: number) => (
                      <Badge key={cropIndex} variant="outline" className="bg-white/50">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Crop Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-lg mb-3 text-green-800">{seasonalAdvice.season}</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {seasonalAdvice.crops.map((crop, index) => (
              <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                {crop}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {seasonalAdvice.activities.map((activity, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                {activity}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------------------- Weather Dashboard ----------------------
const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = OPENWEATHER_API_KEY;

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "clouds":
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "snow":
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!API_KEY) {
        throw new Error("Weather API key is missing");
      }
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!currentResponse.ok) throw new Error("Failed to fetch weather data");
      const currentData = await currentResponse.json();
      setCurrentWeather(currentData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!forecastResponse.ok) throw new Error("Failed to fetch forecast data");
      const forecastData = await forecastResponse.json();
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError("Location denied. Using Delhi as default.");
          fetchWeatherData(28.6139, 77.209);
        }
      );
    } else {
      setError("Geolocation not supported. Using Delhi as default.");
      fetchWeatherData(28.6139, 77.209);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const getDailyForecast = () => {
    if (!forecast) return [];
    const daily: { [key: string]: typeof forecast.list[0] } = {};
    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) daily[date] = item;
    });
    return Object.values(daily).slice(0, 7);
  };

  const chartData =
    getDailyForecast().map((day) => ({
      day: new Date(day.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      maxTemp: Math.round(day.main.temp_max),
      minTemp: Math.round(day.main.temp_min),
      rainfall: day.rain?.["3h"] || 0,
    })) || [];

  return (
    <section id="weather" className="py-12 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cloud className="w-48 h-48" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
            Weather Intelligence
          </h2>
          <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto relative z-10">
            Real-time hyper-local weather monitoring with AI-powered agricultural insights
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-600 animate-in fade-in slide-in-from-top-2">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Current Weather */}
        {currentWeather && (
          <div className="mb-8">
            <Card className="bg-white border-none shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-1"></div>
              <CardHeader className="text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0 pb-2 border-b border-gray-100 bg-gray-50/30">
                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-green-700 mb-1">
                    <MapPin className="h-5 w-5" />
                    <h3 className="text-2xl font-bold">{currentWeather.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm capitalize flex items-center justify-center sm:justify-start">
                    {currentWeather.weather[0].description}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                  <div className="flex items-center mb-6 md:mb-0">
                    <div className="p-4 bg-yellow-50 rounded-full mr-6 shadow-inner">
                      {getWeatherIcon(currentWeather.weather[0].main)}
                    </div>
                    <div>
                      <div className="text-6xl font-bold text-gray-900 tracking-tight">
                        {Math.round(currentWeather.main.temp)}°
                      </div>
                      <p className="text-gray-500 font-medium">Current Temperature</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:border-green-200 transition-colors">
                      <Thermometer className="h-5 w-5 mx-auto mb-2 text-red-500" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Feels Like</p>
                      <p className="text-lg font-bold text-gray-900">{Math.round(currentWeather.main.feels_like)}°</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:border-green-200 transition-colors">
                      <Droplets className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Humidity</p>
                      <p className="text-lg font-bold text-gray-900">{currentWeather.main.humidity}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:border-green-200 transition-colors">
                      <Wind className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Wind</p>
                      <p className="text-lg font-bold text-gray-900">{currentWeather.wind.speed} m/s</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:border-green-200 transition-colors">
                      <Eye className="h-5 w-5 mx-auto mb-2 text-teal-500" />
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Visibility</p>
                      <p className="text-lg font-bold text-gray-900">{(currentWeather.visibility / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Agricultural Advisory */}
        {currentWeather && (
          <div className="mb-10">
            <AgricultureAdvisory
              weatherData={{
                location: currentWeather.name,
                temperature: currentWeather.main.temp,
                humidity: currentWeather.main.humidity,
                windSpeed: currentWeather.wind.speed,
                visibility: currentWeather.visibility / 1000,
                rainfall: forecast?.list[0]?.rain?.["3h"] || 0,
                condition: currentWeather.weather[0].main,
                icon: currentWeather.weather[0].icon,
                uv: 5,
              }}
            />
          </div>
        )}

        {/* Forecast + Chart */}
        {forecast && (
          <div className="space-y-8">
            {/* Forecast Cards */}
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/30">
                <CardTitle>7-Day Forecast</CardTitle>
                <CardDescription>Predicted weather conditions for the upcoming week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-4">
                  {getDailyForecast().map((day) => {
                    const date = new Date(day.dt * 1000);
                    return (
                      <div
                        key={day.dt}
                        className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group"
                      >
                        <p className="font-semibold text-gray-700 text-sm mb-3">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                        <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                          {getWeatherIcon(day.weather[0].main)}
                        </div>
                        <div className="flex justify-center items-baseline space-x-2">
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(day.main.temp_max)}°
                          </p>
                          <p className="text-sm text-gray-400 font-medium">
                            {Math.round(day.main.temp_min)}°
                          </p>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 capitalize px-2 py-1 bg-gray-50 rounded-full">
                          {day.weather[0].main}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/30">
                <CardTitle>Temperature & Rainfall Trend</CardTitle>
                <CardDescription>Visual analysis of temperature fluctuations and expected precipitation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        yAxisId="temp"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        unit="°C"
                      />
                      <YAxis
                        yAxisId="rain"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        unit="mm"
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="maxTemp"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        name="Max Temp"
                      />
                      <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="minTemp"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 4, strokeWidth: 2 }}
                        name="Min Temp"
                      />
                      <Line
                        yAxisId="rain"
                        type="monotone"
                        dataKey="rainfall"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        name="Rainfall"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12 pb-8">
          <Button
            onClick={getUserLocation}
            disabled={loading}
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 px-8 py-6 h-auto text-base rounded-full shadow-sm"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-5 w-5" />
            )}
            Refresh Weather Data
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WeatherDashboard;
