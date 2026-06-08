import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Interceptor: adjunta token en cada solicitud
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejo global de errores
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
    }
    return Promise.reject(err);
  }
);

// 🔐 Autenticacion
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  registro: (data) => api.post("/auth/registro", data),
  logout: () => api.post("/auth/logout"),
  perfil: () => api.get("/auth/perfil"),
  verificarContrasena: (contrasena) => api.post("/auth/verificar-contrasena", { contrasena }),
};

// 📅 Citas
export const citasAPI = {
  listar: () => api.get("/citas"),
  crear: (data) => api.post("/citas", data),
  actualizar: (id, data) => api.put(`/citas/${id}`, data),
  eliminar: (id) => api.delete(`/citas/${id}`),
};

// 💊 Medicamentos
export const medicamentosAPI = {
  listar: () => api.get("/medicamentos"),
  crear: (data) => api.post("/medicamentos", data),
  actualizar: (id, data) => api.put(`/medicamentos/${id}`, data),
  eliminar: (id) => api.delete(`/medicamentos/${id}`),
  registrarToma: (id, data) => api.post(`/medicamentos/${id}/toma`, data),
};

// 🤖 Asistente IA
export const asistenteAPI = {
  enviarMensaje: (mensaje) => api.post("/asistente", { mensaje }),
};

// ✝️ Espiritual
export const espiritualAPI = {
  versiculo: (categoria) => api.get("/espiritual/versiculo", { params: { categoria } }),
  categorias: () => api.get("/espiritual/categorias"),
};

// 📊 Estadisticas
export const estadisticasAPI = {
  obtener: () => api.get("/estadisticas"),
};

// 📄 Reportes
export const reportesAPI = {
  obtener: () => api.get("/reportes"),
};

export default api;
