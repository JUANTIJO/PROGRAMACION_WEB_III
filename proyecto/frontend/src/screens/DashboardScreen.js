import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { citasAPI, medicamentosAPI, espiritualAPI } from "../services/api";

// ========== CONFIGURACIÓN CENTRALIZADA ==========
const CONFIG = {
  colores: {
    primario: "#249a9e",
    secundario: "#52B788",
    fondo: "#F0F7F4",
    texto: "#2C3E50",
    blanco: "#FFFFFF",
    alerta: "#E65100",
    versiculo: "#F59E0B"
  },
  
  modulos: [
    { titulo: "Citas Médicas", emoji: "📅", pantalla: "Citas", color: "#E8F5E9" },
    { titulo: "Medicación", emoji: "💊", pantalla: "Medicacion", color: "#E3F2FD" },
    { titulo: "Asistente IA", emoji: "🤖", pantalla: "Asistente", color: "#FFF3E0" },
    { titulo: "Espiritual", emoji: "🕇", pantalla: "Espiritual", color: "#FCE4EC" },
    { titulo: "Estadísticas", emoji: "📊", pantalla: "Estadisticas", color: "#E8EAF6" },
    { titulo: "Reportes", emoji: "📄", pantalla: "Reportes", color: "#E0F2F1" },
  ],
  
  textos: {
    logout: "Salir",
    versiculoTitulo: "🕇 Versículo del día",
    proximaCita: "📅 Próxima cita",
    modulosTitulo: "Módulos",
    confirmarSalir: "¿Estás seguro de que deseas salir?",
    cancelar: "Cancelar",
    salir: "Salir"
  }
};

// ========== HOOK PERSONALIZADO PARA DATOS ==========
const useDashboardData = () => {
  const [usuario, setUsuario] = useState(null);
  const [proximaCita, setProximaCita] = useState(null);
  const [versiculo, setVersiculo] = useState(null);
  const [pendientesMed, setPendientesMed] = useState(0);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const userData = await SecureStore.getItemAsync("usuario");
      if (userData) setUsuario(JSON.parse(userData));
      
      const citas = await citasAPI.listar();
      const proxima = citas.data.citas.find(
        c => c.estado === "pendiente" && new Date(c.fecha_hora) > new Date()
      );
      setProximaCita(proxima);
      
      const versRes = await espiritualAPI.versiculo();
      setVersiculo(versRes.data.versiculo);
      
      const meds = await medicamentosAPI.listar();
      setPendientesMed(meds.data.medicamentos?.length || 0);
    } catch (err) {
      console.log("Error cargando dashboard:", err.message);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    await cargarDatos();
    setRefrescando(false);
  }, [cargarDatos]);

  useEffect(() => {
    cargarDatos();
  }, []);

  return { usuario, proximaCita, versiculo, pendientesMed, refrescando, onRefresh };
};

// ========== COMPONENTES ==========

// Componente: Encabezado
const Encabezado = ({ usuario, onCerrarSesion }) => {
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <View style={estilos.encabezado}>
      <View style={estilos.encabezadoFila}>
        <View style={estilos.saludoContenedor}>
          <Text style={estilos.saludo}>Hola, {usuario?.nombre || "Usuario"}</Text>
          <Text style={estilos.fecha}>{fecha}</Text>
        </View>
        <TouchableOpacity style={estilos.botonLogout} onPress={onCerrarSesion}>
          <Text style={estilos.textoLogout}>{CONFIG.textos.logout}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Componente: Versículo del día
const VersiculoCard = ({ versiculo }) => {
  if (!versiculo) return null;
  
  return (
    <View style={estilos.versiculoCard}>
      <Text style={estilos.versiculoTitulo}>{CONFIG.textos.versiculoTitulo}</Text>
      <Text style={estilos.versiculoTexto}>"{versiculo.texto}"</Text>
      <Text style={estilos.versiculoRef}>✝️ {versiculo.referencia}</Text>
    </View>
  );
};

// Componente: Próxima cita
const CitaCard = ({ cita }) => {
  if (!cita) return null;
  
  const fecha = new Date(cita.fecha_hora).toLocaleString("es-ES");
  
  return (
    <View style={estilos.citaCard}>
      <Text style={estilos.cardTitulo}>{CONFIG.textos.proximaCita}</Text>
      <Text style={estilos.citaNombre}>{cita.titulo}</Text>
      <Text style={estilos.citaInfo}>Dr. {cita.doctor}</Text>
      <Text style={estilos.citaFecha}>{fecha}</Text>
    </View>
  );
};

// Componente: Alerta de medicamentos
const AlertaMedicamentos = ({ cantidad }) => {
  if (cantidad === 0) return null;
  
  return (
    <View style={estilos.alertaCard}>
      <Text style={estilos.alertaTexto}>💊 Tienes {cantidad} medicamento(s) activos</Text>
    </View>
  );
};

// Componente: Grid de módulos
const ModuloGrid = ({ navigation }) => (
  <>
    <Text style={estilos.seccionTitulo}>{CONFIG.textos.modulosTitulo}</Text>
    <View style={estilos.grilla}>
      {CONFIG.modulos.map((modulo) => (
        <TouchableOpacity
          key={modulo.pantalla}
          style={[estilos.moduloCard, { backgroundColor: modulo.color }]}
          onPress={() => navigation.navigate(modulo.pantalla)}
        >
          <Text style={estilos.moduloEmoji}>{modulo.emoji}</Text>
          <Text style={estilos.moduloTitulo}>{modulo.titulo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
);

// ========== COMPONENTE PRINCIPAL ==========
export default function DashboardScreen({ navigation }) {
  const { usuario, proximaCita, versiculo, pendientesMed, refrescando, onRefresh } = useDashboardData();

  const cerrarSesion = () => {
    Alert.alert(CONFIG.textos.logout, CONFIG.textos.confirmarSalir, [
      { text: CONFIG.textos.cancelar, style: "cancel" },
      {
        text: CONFIG.textos.salir,
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          await SecureStore.deleteItemAsync("usuario");
          navigation.replace("Login");
        }
      }
    ]);
  };

  return (
    <ScrollView
      style={estilos.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
    >
      <Encabezado usuario={usuario} onCerrarSesion={cerrarSesion} />
      <VersiculoCard versiculo={versiculo} />
      <CitaCard cita={proximaCita} />
      <AlertaMedicamentos cantidad={pendientesMed} />
      <ModuloGrid navigation={navigation} />
    </ScrollView>
  );
}

// ========== ESTILOS ==========
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "transparent"
  },
  
  // Encabezado
  encabezado: {
    backgroundColor: CONFIG.colores.primario,
    padding: 24,
    paddingTop: 50
  },
  encabezadoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  saludoContenedor: {
    flex: 1
  },
  saludo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff"
  },
  fecha: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4
  },
  botonLogout: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4
  },
  textoLogout: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600"
  },
  
  // Versículo
  versiculoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: CONFIG.colores.versiculo
  },
  versiculoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8
  },
  versiculoTexto: {
    fontSize: 15,
    color: "#78350F",
    fontStyle: "italic",
    lineHeight: 20
  },
  versiculoRef: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 8,
    textAlign: "right",
    fontWeight: "600"
  },
  
  // Cita
  citaCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: CONFIG.colores.primario
  },
  cardTitulo: {
    fontSize: 12,
    fontWeight: "700",
    color: CONFIG.colores.primario,
    marginBottom: 6
  },
  citaNombre: {
    fontSize: 18,
    fontWeight: "800",
    color: CONFIG.colores.texto
  },
  citaInfo: {
    fontSize: 13,
    color: "#555",
    marginTop: 2
  },
  citaFecha: {
    fontSize: 12,
    color: CONFIG.colores.primario,
    marginTop: 6,
    fontWeight: "600"
  },
  
  // Alerta
  alertaCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 10
  },
  alertaTexto: {
    fontSize: 14,
    color: CONFIG.colores.alerta,
    fontWeight: "600"
  },
  
  // Módulos
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: CONFIG.colores.texto,
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 12
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 24
  },
  moduloCard: {
    width: "44%",
    margin: "3%",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 6
  },
  moduloEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  moduloTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: CONFIG.colores.texto,
    textAlign: "center"
  }
});