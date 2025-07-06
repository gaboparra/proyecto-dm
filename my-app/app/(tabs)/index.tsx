import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function IndexScreen() {
  const [city, setCity] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSearch = () => {
    if (city.trim()) {
      router.push({ pathname: "/(tabs)/weather", params: { city } });
      setCity("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1e1e2f" : "#caf0f8" },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#0077b6" }]}>
        Buscar Clima por Ciudad
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#2c2c3e" : "#ffffff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
        placeholder="Ej: Buenos Aires"
        placeholderTextColor={isDark ? "#888" : "#999"}
        value={city}
        onChangeText={setCity}
      />
      <View style={styles.button}>
        <Button title="Buscar" onPress={handleSearch} color="#00b4d8" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 10,
    overflow: "hidden",
  },
});
