import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

type HistoryItem = {
  city: string;
  temp: number;
  description: string;
  icon: string;
  timestamp: number;
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem("weatherHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (e) {
      console.error("Error al cargar historial:", e);
    }
  };

  const clearHistory = async () => {
    Alert.alert("Confirmar", "¿Borrar todo el historial?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("weatherHistory");
          setHistory([]);
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const goToCity = (city: string) => {
    router.push({ pathname: "/(tabs)/weather", params: { city } });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#1e1e2f" : "#d0f0ff",
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#0077b6" }]}>
          Historial de Búsqueda
        </Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.trashBtn}>
            <MaterialIcons
              name="delete-forever"
              size={28}
              color={isDark ? "#ff8080" : "#d00000"}
            />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#333" }]}>
          No hay búsquedas recientes.
        </Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => item.city + index}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => goToCity(item.city)}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: isDark ? "#2c2c3e" : "#ffffffcc",
                    borderColor: isDark ? "#444" : "#ccc",
                  },
                ]}
              >
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png`,
                  }}
                  style={styles.icon}
                />
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.city,
                      { color: isDark ? "#fff" : "#023e8a" },
                    ]}
                  >
                    {item.city}
                  </Text>
                  <Text style={{ color: isDark ? "#ccc" : "#333" }}>
                    {item.temp.toFixed(1)}°C - {item.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  trashBtn: {
    padding: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  city: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
