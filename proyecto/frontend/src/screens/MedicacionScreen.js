import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { medicamentosAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const COLORES = { 
  primario: "#2D6A4F", 
  fondo: "transparent", 
  texto: "#2C3E50" 
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MedicacionScreen({ navigation }) {
  // ===== ESTADOS =====
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ===== FUNCIONES DE API =====
  const cargarMedicamentos = async () => {
    try {
      const r = await medicamentosAPI.listar();
      setMedicamentos(r.data.medicamentos || []);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar los medicamentos");
    } finally {
      setCargando(false);
    }
  };

  // ===== EFECTOS =====
  useEffect(() => {
    cargarMedicamentos();
    
    // Recargar cuando la pantalla recibe foco
    const unsubscribe = navigation.addListener('focus', cargarMedicamentos);
    return unsubscribe;
  }, [navigation]);

  // ===== RENDERIZADO DE CADA MEDICAMENTO =====
  const renderItem = ({ item }) => (
    <View style={estilos.tarjeta}>
      {/* Indicador de color de la pastilla */}
      <View style={[estilos.colorPastilla, { backgroundColor: item.color_pastilla || "#4A90E2" }]} />
      
      {/* Información del medicamento */}
      <View style={estilos.info}>
        <Text style={estilos.nombre}>{item.nombre}</Text>
        <Text style={estilos.detalle}>{item.dosis} - {item.frecuencia}</Text>
      </View>
    </View>
  );

  // ===== PANTALLA DE CARGA =====
  if (cargando) {
    return <ActivityIndicator size="large" color={COLORES.primario} style={estilos.centrado} />;
  }

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <View style={estilos.contenedor}>
      
      {/* HEADER */}
      <View style={estilos.tituloFila}>
        <Text style={estilos.titulo}>💊 Medicación</Text>
      </View>
      
      {/* LISTA DE MEDICAMENTOS */}
      <FlatList
        data={medicamentos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={estilos.vacio}>No hay medicamentos registrados</Text>}
        contentContainerStyle={estilos.lista}
      />
      
      {/* BOTÓN FLOTANTE PARA AGREGAR */}
      <TouchableOpacity 
        style={estilos.botonFlotante} 
        onPress={() => Alert.alert("Próximamente", "Formulario de creación en desarrollo")}
      >
        <Text style={estilos.textoBotonFlotante}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================

const estilos = StyleSheet.create({
  // Contenedor principal
  contenedor: { flex: 1, backgroundColor: "transparent", padding: 16 },
  
  // Estado de carga
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Header
  tituloFila: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  tituloIcono: { marginRight: 8 },
  titulo: { fontSize: 24, fontWeight: "800", color: COLORES.texto },
  
  // Lista
  lista: { paddingBottom: 80 },
  
  // Tarjeta de medicamento
  tarjeta: { 
    flexDirection: "row", 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOpacity: 0.05, 
    elevation: 2 
  },
  colorPastilla: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "600", color: COLORES.texto },
  detalle: { fontSize: 14, color: "#666", marginTop: 4 },
  
  // Estado vacío
  vacio: { textAlign: "center", color: "#666", marginTop: 40 },
  
  // Botón flotante
  botonFlotante: { 
    position: "absolute", 
    right: 16, 
    bottom: 16, 
    backgroundColor: COLORES.primario, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 4 
  },
  textoBotonFlotante: { color: "#fff", fontSize: 32, fontWeight: "bold" },
});