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

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("weatherHistory");
      setHistory(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error("Error al cargar historial:", e);
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
  Alert.alert("Confirmar", "¿Borrar todo el historial?", [
    {
      text: "Cancelar",
      style: "cancel",
    },
    {
      text: "Borrar",
      style: "destructive",
      onPress: async () => {
        try {
          await AsyncStorage.removeItem("weatherHistory");

          setHistory([]);

          console.log("Historial borrado correctamente.");
        } catch (e) {
          console.error("Error al borrar historial:", e);
          Alert.alert("Error", "No se pudo borrar el historial");
        }
      },
    },
  ]);
};

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const goToCity = (city: string) => {
    router.push({ pathname: "/(tabs)/weather", params: { city } });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1e1e2f" : "#d0f0ff" },
      ]}
    >
      {/* CABECERA */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#0077b6" }]}>
          Historial de Búsqueda
        </Text>
        {history.length > 0 && (
          <TouchableOpacity 
            onPress={clearHistory} 
            style={styles.trashBtn}
            testID="clear-history-button"
          >
            <MaterialIcons
              name="delete-forever"
              size={28}
              color={isDark ? "#ff8080" : "#d00000"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA O MENSAJE VACÍO */}
      {history.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#333" }]}>
          No hay búsquedas recientes.
        </Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.city}-${item.timestamp}-${index}`}
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
                    style={[styles.city, { color: isDark ? "#fff" : "#023e8a" }]}
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