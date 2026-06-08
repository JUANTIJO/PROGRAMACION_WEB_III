import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { estadisticasAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const { width } = Dimensions.get("window");
const COLORES = { primario: "#2D6A4F", fondo: "#F0F7F4" };

// ============================================
// COMPONENTE BARRA DE PROGRESO (SIN DEPENDENCIAS EXTERNAS)
// ============================================

const BarraProgreso = ({ etiqueta, valor, total, color }) => {
  const pct = total > 0 ? (valor / total) * 100 : 0;
  
  return (
    <View style={bar.contenedor}>
      <View style={bar.fila}>
        <Text style={bar.etiqueta}>{etiqueta}</Text>
        <Text style={bar.valor}>{valor}/{total} ({pct.toFixed(0)}%)</Text>
      </View>
      <View style={bar.fondo}>
        <View style={[bar.relleno, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// Estilos del componente BarraProgreso
const bar = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  fila: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  etiqueta: { fontSize: 13, color: "#555", fontWeight: "600" },
  valor: { fontSize: 12, color: "#888" },
  fondo: { height: 10, backgroundColor: "#E0E0E0", borderRadius: 5 },
  relleno: { height: 10, borderRadius: 5 },
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EstadisticasScreen() {
  // ===== ESTADOS =====
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ===== EFECTOS =====
  useEffect(() => {
    estadisticasAPI.obtener()
      .then(r => setDatos(r.data))
      .catch(err => console.log("Error:", err.message))
      .finally(() => setCargando(false));
  }, []);

  // ===== PANTALLA DE CARGA =====
  if (cargando) {
    return <ActivityIndicator size="large" color={COLORES.primario} style={{ marginTop: 80 }} />;
  }

  // ===== PROCESAMIENTO DE DATOS DE CITAS =====
  const citasMap = {};
  datos?.citas?.forEach(c => { 
    citasMap[c.estado] = parseInt(c.total); 
  });
  const totalCitas = Object.values(citasMap).reduce((a, b) => a + b, 0);

  // ===== PROCESAMIENTO DE DATOS DE MEDICACIÓN =====
  const medMap = { tomados: 0, olvidados: 0 };
  datos?.medicacion?.forEach(m => {
    if (m.tomado) {
      medMap.tomados = parseInt(m.total);
    } else {
      medMap.olvidados = parseInt(m.total);
    }
  });
  const totalMed = medMap.tomados + medMap.olvidados;
  const cumplimiento = totalMed > 0 ? ((medMap.tomados / totalMed) * 100).toFixed(1) : 0;

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <ScrollView style={estilos.contenedor}>
      
      {/* HEADER */}
      <View style={estilos.header}>
        <View style={estilos.headerFila}>
          <Text style={estilos.titulo}>📊 Estadisticas de Salud</Text>
        </View>
        <Text style={estilos.subtitulo}>Tu resumen de seguimiento</Text>
      </View>

      {/* TARJETA: CUMPLIMIENTO DE MEDICACIÓN */}
      <View style={estilos.tarjeta}>
        <View style={estilos.tarjetaTituloFila}>
          <Text style={estilos.tarjetaTitulo}>💊 Cumplimiento de Medicacion</Text>
        </View>
        
        {/* Indicador circular de porcentaje */}
        <View style={estilos.indicadorCircular}>
          <Text style={estilos.porcentaje}>{cumplimiento}%</Text>
          <Text style={estilos.porcentajeSub}>cumplimiento</Text>
        </View>
        
        {/* Barras de progreso */}
        <BarraProgreso etiqueta="Tomados" valor={medMap.tomados} total={totalMed} color="#4CAF50" />
        <BarraProgreso etiqueta="Olvidados" valor={medMap.olvidados} total={totalMed} color="#EF5350" />
      </View>

      {/* TARJETA: HISTORIAL DE CITAS */}
      <View style={estilos.tarjeta}>
        <View style={estilos.tarjetaTituloFila}>
          <Text style={estilos.tarjetaTitulo}>📅 Historial de Citas</Text>
        </View>
        
        {/* Barras de progreso por estado de cita */}
        <BarraProgreso etiqueta="Completadas" valor={citasMap.completada || 0} total={totalCitas} color="#43A047" />
        <BarraProgreso etiqueta="Pendientes" valor={citasMap.pendiente || 0} total={totalCitas} color="#FFA726" />
        <BarraProgreso etiqueta="Perdidas" valor={citasMap.perdida || 0} total={totalCitas} color="#EF5350" />
        <BarraProgreso etiqueta="Canceladas" valor={citasMap.cancelada || 0} total={totalCitas} color="#78909C" />
      </View>

      {/* TARJETAS DE RESUMEN RÁPIDO */}
      <View style={estilos.resumenFila}>
        {[
          { icon: "✅", valor: citasMap.completada || 0, etiqueta: "Citas completadas", color: "#E8F5E9" },
          { icon: "💊", valor: medMap.tomados, etiqueta: "Dosis tomadas", color: "#E3F2FD" },
          { icon: "⏰", valor: citasMap.pendiente || 0, etiqueta: "Citas pendientes", color: "#FFF3E0" },
          { icon: "⚠️", valor: medMap.olvidados, etiqueta: "Dosis olvidadas", color: "#FFEBEE" },
        ].map(({ icon, valor, etiqueta, color }) => (
          <View key={etiqueta} style={[estilos.resumenCard, { backgroundColor: color }]}>
            <Text style={estilos.resumenEmoji}>{icon}</Text>
            <Text style={estilos.resumenValor}>{valor}</Text>
            <Text style={estilos.resumenEtiqueta}>{etiqueta}</Text>
          </View>
        ))}
      </View>

      {/* MENSAJE CUANDO NO HAY DATOS */}
      {totalMed === 0 && totalCitas === 0 && (
        <Text style={estilos.sinDatos}>
          Aun no hay datos suficientes. Comienza registrando citas y medicamentos!
        </Text>
      )}
    </ScrollView>
  );
}

// ============================================
// ESTILOS
// ============================================

const estilos = StyleSheet.create({
  // Contenedor principal
  contenedor: { flex: 1, backgroundColor: "transparent" },
  
  // Header
  header: { backgroundColor: COLORES.primario, padding: 24, paddingTop: 50 },
  headerFila: { flexDirection: "row", alignItems: "center" },
  headerIcono: { marginRight: 8 },
  titulo: { fontSize: 22, fontWeight: "800", color: "#fff" },
  subtitulo: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  
  // Tarjetas principales
  tarjeta: { 
    margin: 16, 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 20, 
    elevation: 2 
  },
  tarjetaTituloFila: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginBottom: 16 
  },
  tarjetaTitulo: { fontSize: 16, fontWeight: "700", color: "#333" },
  
  // Indicador circular de porcentaje
  indicadorCircular: { 
    alignItems: "center", 
    marginBottom: 20, 
    backgroundColor: COLORES.fondo, 
    borderRadius: 60, 
    width: 120, 
    height: 120, 
    justifyContent: "center", 
    alignSelf: "center" 
  },
  porcentaje: { fontSize: 32, fontWeight: "900", color: COLORES.primario },
  porcentajeSub: { fontSize: 12, color: "#777" },
  
  // Tarjetas de resumen rápido
  resumenFila: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    paddingHorizontal: 12, 
    marginBottom: 24 
  },
  resumenCard: { 
    width: "44%", 
    margin: "3%", 
    borderRadius: 14, 
    padding: 16, 
    alignItems: "center" 
  },
  resumenEmoji: { fontSize: 32, marginBottom: 6 },
  resumenValor: { fontSize: 28, fontWeight: "900", color: "#2C3E50" },
  resumenEtiqueta: { fontSize: 11, color: "#666", textAlign: "center", marginTop: 4 },
  
  // Mensaje sin datos
  sinDatos: { textAlign: "center", color: "#999", padding: 20, fontSize: 14 },
});