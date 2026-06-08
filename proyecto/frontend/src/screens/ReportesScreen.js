import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import * as Print from "expo-print";
import { reportesAPI } from "../services/api";

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

export default function ReportesScreen() {
  // ===== ESTADOS =====
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ===== FUNCIONES DE API =====
  const cargarReporte = async () => {
    try {
      const r = await reportesAPI.obtener();
      setReporte(r.data);
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el reporte");
    } finally {
      setCargando(false);
    }
  };

  // ===== EFECTOS =====
  useEffect(() => { 
    cargarReporte(); 
  }, []);

  // ===== FUNCIÓN PARA GENERAR PDF =====
  const generarPDF = async () => {
    if (!reporte) return;
    
    // Plantilla HTML para el PDF
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2D6A4F; }
            .fecha { color: #666; margin-bottom: 20px; }
            .seccion { margin-top: 20px; }
            .titulo-seccion { color: #2D6A4F; border-bottom: 2px solid #2D6A4F; }
          </style>
        </head>
        <body>
          <h1>📄 Reporte de Salud</h1>
          <p class="fecha">Fecha: ${new Date().toLocaleDateString()}</p>
          
          <div class="seccion">
            <h3 class="titulo-seccion">📅 Citas Médicas</h3>
            <p>Total de citas: ${reporte.citas?.length || 0}</p>
          </div>
          
          <div class="seccion">
            <h3 class="titulo-seccion">💊 Medicamentos</h3>
            <p>Total de medicamentos: ${reporte.medicamentos?.length || 0}</p>
          </div>
        </body>
      </html>
    `;
    
    try {
      await Print.printAsync({ html });
      Alert.alert("Exito", "Reporte generado correctamente");
    } catch (err) {
      Alert.alert("Error", "No se pudo generar el reporte");
    }
  };

  // ===== PANTALLA DE CARGA =====
  if (cargando) {
    return <ActivityIndicator size="large" color={COLORES.primario} style={estilos.centrado} />;
  }

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <View style={estilos.contenedor}>
      
      {/* HEADER */}
      <View style={estilos.tituloFila}>
        <Text style={estilos.titulo}>📄 Reportes</Text>
      </View>
      
      {/* TARJETA INFORMATIVA */}
      <View style={estilos.infoCard}>
        <Text style={estilos.infoText}>
          Genera un reporte PDF con tu informacion de salud
        </Text>
      </View>
      
      {/* BOTÓN PARA GENERAR PDF */}
      <TouchableOpacity style={estilos.boton} onPress={generarPDF}>
        <View style={estilos.botonFila}>
          <Text style={estilos.textoBoton}>📄 Generar PDF</Text>
        </View>
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
  
  // Tarjeta informativa
  infoCard: { 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20 
  },
  infoText: { fontSize: 16, color: "#666" },
  
  // Botón
  boton: { 
    backgroundColor: COLORES.primario, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  botonFila: { flexDirection: "row", alignItems: "center", gap: 8 },
  textoBoton: { color: "#fff", fontSize: 16, fontWeight: "700" },
});