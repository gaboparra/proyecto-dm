import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getWeatherByCity } from "@/services/weatherApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WeatherScreen() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (city) {
      getWeatherByCity(city)
        .then(async (data) => {
          setWeather(data);
          setError(null);

          try {
            const stored = await AsyncStorage.getItem("weatherHistory");
            const history = stored ? JSON.parse(stored) : [];

            const newEntry = {
              city: data.name,
              temp: data.main.temp,
              description: data.weather[0].description,
              icon: data.weather[0].icon,
              timestamp: Date.now(),
            };

            const updated = [
              newEntry,
              ...history.filter((item: any) => item.city !== data.name),
            ];

            await AsyncStorage.setItem(
              "weatherHistory",
              JSON.stringify(updated.slice(0, 10))
            );
          } catch (e) {
            console.error("Error guardando historial", e);
          }
        })
        .catch(() => {
          setError("No se pudo obtener el clima.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [city]);

  if (loading)
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  if (error)
    return (
      <Text style={[styles.error, isDark && { color: "#ff8080" }]}>
        {error}
      </Text>
    );

  if (!weather) return null;

  const icon = weather.weather[0]?.icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const textStyle = isDark ? { color: "#fff" } : { color: "#023e8a" };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1e1e2f" : "#e0f7fa" },
      ]}
    >
      <Text style={[styles.city, textStyle]}>{weather.name}</Text>
      <Image source={{ uri: iconUrl }} style={styles.icon} />
      <Text style={[styles.temp, textStyle]}>
        {weather.main.temp.toFixed(1)}°C
      </Text>
      <Text style={[styles.desc, textStyle]}>
        {weather.weather[0].description}
      </Text>
      <Text style={textStyle}>
        🌡️ Sensación térmica: {weather.main.feels_like.toFixed(1)}°C
      </Text>
      <Text style={textStyle}>💧 Humedad: {weather.main.humidity}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  city: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  temp: {
    fontSize: 52,
    fontWeight: "bold",
  },
  desc: {
    fontSize: 20,
    fontStyle: "italic",
    marginBottom: 10,
  },
  icon: {
    width: 120,
    height: 120,
  },
  error: {
    marginTop: 40,
    color: "red",
    textAlign: "center",
  },
});
