/**
 * generateWeatherAdvice — AI-style farming advice from live weather data
 * Used in SmartBanner (Today Focus) and WeatherImpact card.
 */

export interface WeatherInput {
  temp: number;
  humidity: number;
  windSpeedKmh: number;
  description: string; // e.g. "light rain", "clear sky"
}

export interface WeatherAdvice {
  primary: string;       // Main action headline
  secondary: string;     // Explanation
  suggestions: string[]; // Bullet list for the card
  tag: "warning" | "info" | "good";
}

export function generateWeatherAdvice(w: WeatherInput): WeatherAdvice {
  const desc = w.description.toLowerCase();
  const isRainy  = desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower");
  const isStormy = desc.includes("storm") || desc.includes("thunder");
  const isFoggy  = desc.includes("fog") || desc.includes("mist") || desc.includes("haze");
  const isClear  = desc.includes("clear") || desc.includes("sunny");
  const highHumidity = w.humidity > 75;
  const veryHot  = w.temp > 38;
  const highWind = w.windSpeedKmh > 25;

  if (isStormy) {
    return {
      primary: "⚡ Storm Alert — Stay Indoors",
      secondary: "Do not operate machinery or spray chemicals",
      suggestions: [
        "Secure loose equipment and covers",
        "Delay all field operations",
        "Check crop shelter status",
      ],
      tag: "warning",
    };
  }
  if (isRainy && highHumidity) {
    return {
      primary: "🌧 Delay Irrigation",
      secondary: "Rain + high humidity → fungal risk",
      suggestions: [
        "Apply copper fungicide after rain stops",
        "Avoid water splash on leaves",
        "Check drainage channels",
      ],
      tag: "warning",
    };
  }
  if (isRainy) {
    return {
      primary: "🌧 Rain Expected — Save Water",
      secondary: "Skip irrigation today — natural rain is sufficient",
      suggestions: [
        "Cover disease-sensitive crops",
        "Hold fertilizer application for 24h",
      ],
      tag: "info",
    };
  }
  if (highWind) {
    return {
      primary: "💨 Avoid Spraying Today",
      secondary: `Wind at ${w.windSpeedKmh} km/h — chemicals will drift`,
      suggestions: [
        "Reschedule pesticide spray to morning",
        "Check for crop lodging risk",
      ],
      tag: "warning",
    };
  }
  if (highHumidity && !isRainy) {
    return {
      primary: "💧 High Humidity — Watch for Fungus",
      secondary: "Conditions favour leaf blight and mildew",
      suggestions: [
        "Increase air circulation in greenhouse",
        "Apply preventive fungicide",
        "Avoid evening irrigation",
      ],
      tag: "warning",
    };
  }
  if (veryHot) {
    return {
      primary: "🌡 Heat Stress Alert",
      secondary: `${w.temp}°C — irrigate early morning or evening`,
      suggestions: [
        "Schedule irrigation before 7 AM",
        "Apply mulch to retain soil moisture",
        "Shade young seedlings",
      ],
      tag: "warning",
    };
  }
  if (isFoggy) {
    return {
      primary: "🌫 Foggy Conditions",
      secondary: "Low visibility — monitor pest activity",
      suggestions: [
        "Inspect leaves for mildew after fog clears",
        "Delay spraying until afternoon",
      ],
      tag: "info",
    };
  }
  if (isClear) {
    return {
      primary: "☀️ Great Day for Field Work",
      secondary: "Ideal conditions for spraying and harvesting",
      suggestions: [
        "Best time for pesticide application",
        "Good conditions for harvesting",
        "Check soil moisture levels",
      ],
      tag: "good",
    };
  }
  return {
    primary: "📋 Monitor Conditions",
    secondary: "Normal farming day — follow regular schedule",
    suggestions: [
      "Check soil moisture",
      "Inspect crop health",
    ],
    tag: "info",
  };
}
