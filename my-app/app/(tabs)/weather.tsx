import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  useColorScheme,
  ScrollView,
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

  const { name, main, weather: weatherInfo, wind, visibility, sys } = weather;

  const icon = weatherInfo[0]?.icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  const textColor = isDark ? "#ffffff" : "#023e8a";
  const bgColor = isDark ? "#1e1e2f" : "#e0f7fa";
  const cardColor = isDark ? "#2d2d44" : "#ffffff";

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} hs`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={styles.container}>
        <Text style={[styles.city, { color: textColor }]}>{name}</Text>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
        <Text style={[styles.temp, { color: textColor }]}>
          {main.temp.toFixed(1)}°C
        </Text>
        <Text style={[styles.desc, { color: textColor }]}>
          {weatherInfo[0].description}
        </Text>

        {/* TARJETA: TEMPERATURAS */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>🌡️ Temperatura</Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Sensación térmica: {main.feels_like.toFixed(1)}°C
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Máxima: {main.temp_max.toFixed(1)}°C
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Mínima: {main.temp_min.toFixed(1)}°C
          </Text>
        </View>

        {/* TARJETA: VIENTO Y HUMEDAD */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>💧 Condiciones</Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Humedad: {main.humidity}%
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Presión: {main.pressure} hPa
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Viento: {wind.speed} m/s
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Visibilidad: {visibility / 1000} km
          </Text>
        </View>

        {/* TARJETA: SOL */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>🌅 Sol</Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Amanecer: {formatTime(sys.sunrise)}
          </Text>
          <Text style={[styles.cardItem, { color: textColor }]}>
            Atardecer: {formatTime(sys.sunset)}
          </Text>
        </View>

        {/* ESPACIO FINAL */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  city: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  icon: {
    width: 120,
    height: 120,
  },
  temp: {
    fontSize: 50,
    fontWeight: "bold",
    marginTop: 10,
  },
  desc: {
    fontSize: 22,
    fontStyle: "italic",
    marginBottom: 20,
    textTransform: "capitalize",
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0077b6",
  },
  cardItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    marginTop: 40,
    color: "red",
    textAlign: "center",
  },
});
