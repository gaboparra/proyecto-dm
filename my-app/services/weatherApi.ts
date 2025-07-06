import axios from "axios";

const API_KEY = "f5e2e7b37f6a46586f62eda61c6db514";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function getWeatherByCity(city: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        lang: "es",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el clima:", error);
    throw error;
  }
}
