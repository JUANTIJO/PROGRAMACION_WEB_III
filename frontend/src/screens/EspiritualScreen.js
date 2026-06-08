import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated } from "react-native";
import { espiritualAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const CATEGORIAS = [
  { valor: "tristeza", emoji: "😢", color: "#7986CB" },
  { valor: "esperanza", emoji: "🌈", color: "#FFB300" },
  { valor: "fortaleza", emoji: "💪", color: "#43A047" },
  { valor: "sanidad", emoji: "🙏", color: "#E91E63" },
  { valor: "paz", emoji: "🕊️", color: "#00ACC1" },
  { valor: "general", emoji: "✝️", color: "#8D6E63" },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EspiritualScreen() {
  // ===== ESTADOS =====
  const [versiculo, setVersiculo] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState("general");
  const [cargando, setCargando] = useState(false);
  
  // ===== ANIMACIONES =====
  const fadeAnim = useState(new Animated.Value(1))[0];

  // ===== FUNCIÓN PARA CARGAR VERSÍCULO =====
  const cargar = async (cat) => {
    setCargando(true);
    
    // Animación de salida
    Animated.timing(fadeAnim, { 
      toValue: 0, 
      duration: 200, 
      useNativeDriver: true 
    }).start(async () => {
      try {
        const r = await espiritualAPI.versiculo(cat);
        setVersiculo(r.data.versiculo);
      } catch { 
        setVersiculo(null); 
      }
      
      setCargando(false);
      
      // Animación de entrada
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    });
  };

  // ===== EFECTOS =====
  useEffect(() => { 
    cargar(categoriaActiva); 
  }, []);

  // ===== MANEJO DE CATEGORÍA =====
  const seleccionarCategoria = (cat) => {
    setCategoriaActiva(cat);
    cargar(cat);
  };

  // ===== OBTENER CATEGORÍA ACTUAL =====
  const catActual = CATEGORIAS.find(c => c.valor === categoriaActiva);

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <ScrollView style={estilos.contenedor}>
      
      {/* HEADER CON COLOR DINÁMICO */}
      <View style={[estilos.header, { backgroundColor: catActual?.color || "#2D6A4F" }]}>
        <Text style={estilos.headerEmoji}>📖</Text>
        <Text style={estilos.headerTitulo}>Modulo Espiritual</Text>
        <Text style={estilos.headerSub}>Encuentra paz en la Palabra</Text>
      </View>

      {/* SELECTOR DE CATEGORÍAS */}
      <View style={estilos.categorias}>
        <Text style={estilos.seccionTitulo}>Selecciona una categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat.valor}
              style={[estilos.catBtn, categoriaActiva === cat.valor && { backgroundColor: cat.color }]}
              onPress={() => seleccionarCategoria(cat.valor)}
            >
              <Text style={estilos.catEmoji}>{cat.emoji}</Text>
              <Text style={[estilos.catTexto, categoriaActiva === cat.valor && { color: "#fff" }]}>
                {cat.valor.charAt(0).toUpperCase() + cat.valor.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* VERSÍCULO DEL DÍA */}
      <View style={estilos.versiculoContenedor}>
        {cargando ? (
          <ActivityIndicator size="large" color={catActual?.color} />
        ) : versiculo ? (
          <Animated.View style={[estilos.versiculoCard, { opacity: fadeAnim, borderColor: catActual?.color }]}>
            <Text style={estilos.comillas}>"</Text>
            <Text style={estilos.versiculoTexto}>{versiculo.texto}</Text>
            <Text style={estilos.comillasCierre}>"</Text>
            <View style={[estilos.referenciaBadge, { backgroundColor: catActual?.color }]}>
              <Text style={estilos.referenciaFila}>✝️ {versiculo.referencia}</Text>
            </View>
          </Animated.View>
        ) : (
          <Text style={estilos.noDisponible}>No hay versiculos disponibles para esta categoria</Text>
        )}

        {/* BOTÓN PARA OTRO VERSÍCULO */}
        <TouchableOpacity
          style={[estilos.btnOtro, { backgroundColor: catActual?.color }]}
          onPress={() => cargar(categoriaActiva)}
          disabled={cargando}
        >
          <View style={estilos.btnOtroFila}>
            <Text style={estilos.btnOtroTexto}>✝️ Otro versiculo</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ORACIÓN DEL DÍA */}
      <View style={estilos.oracion}>
        <View style={estilos.oracionTituloFila}>
          <Text style={estilos.oracionTitulo}>🙏 Oracion del dia</Text>
        </View>
        <Text style={estilos.oracionTexto}>
          "Senor, dame la fuerza para enfrentar cada dia, la paz para aceptar lo que no puedo cambiar,
          y la sabiduria para tomar las decisiones correctas en mi salud. Amen."
        </Text>
      </View>
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
  header: { padding: 32, alignItems: "center", paddingTop: 60 },
  headerEmoji: { fontSize: 50, marginBottom: 8 },
  headerTitulo: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  
  // Selector de categorías
  categorias: { paddingTop: 20 },
  seccionTitulo: { fontSize: 16, fontWeight: "700", color: "#333", paddingLeft: 16, marginBottom: 12 },
  catBtn: { 
    backgroundColor: "#F0F0F0", 
    borderRadius: 20, 
    padding: 12, 
    marginRight: 10, 
    alignItems: "center", 
    minWidth: 90 
  },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catTexto: { fontSize: 12, fontWeight: "600", color: "#555" },
  
  // Contenedor del versículo
  versiculoContenedor: { padding: 20, alignItems: "center" },
  versiculoCard: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 28, 
    borderWidth: 2, 
    elevation: 4, 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  comillas: { fontSize: 60, color: "#DDD", marginBottom: -20, fontFamily: "Georgia" },
  versiculoTexto: { 
    fontSize: 18, 
    lineHeight: 28, 
    color: "#2C3E50", 
    textAlign: "center", 
    fontStyle: "italic" 
  },
  comillasCierre: { 
    fontSize: 60, 
    color: "#DDD", 
    textAlign: "right", 
    marginTop: -20, 
    fontFamily: "Georgia" 
  },
  referenciaBadge: { 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    alignSelf: "center", 
    marginTop: 16 
  },
  referenciaFila: { flexDirection: "row", alignItems: "center", gap: 6 },
  referenciaTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
  noDisponible: { color: "#999", textAlign: "center", fontSize: 16 },
  
  // Botón "Otro versículo"
  btnOtro: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 20 },
  btnOtroFila: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnOtroTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  
  // Sección de oración
  oracion: { margin: 20, padding: 20, backgroundColor: "#FFF8E1", borderRadius: 14 },
  oracionTituloFila: { flexDirection: "row", alignItems: "center", gap: 6 },
  oracionTitulo: { fontSize: 16, fontWeight: "700", color: "#92400E", marginBottom: 10 },
  oracionTexto: { fontSize: 14, color: "#78350F", lineHeight: 22, fontStyle: "italic" },
});