import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { asistenteAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const COLORES = { primario: "#2D6A4F", fondo: "#F0F7F4" };

const SUGERENCIAS = [
  "Me siento triste hoy",
  "Tengo miedo a los resultados",
  "Me siento bien!",
  "Tengo mucho dolor",
  "Necesito motivacion",
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AsistenteScreen() {
  // ===== ESTADOS =====
  const [mensajes, setMensajes] = useState([
    { id: "0", tipo: "ia", texto: "Hola! Soy tu asistente de salud y bienestar. Estoy aqui para escucharte y apoyarte. Como te sientes hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  
  // ===== REFERENCIAS =====
  const listaRef = useRef(null);

  // ===== FUNCIÓN PARA ENVIAR MENSAJES =====
  const enviar = async (texto = input) => {
    if (!texto.trim() || cargando) return;
    
    // Agregar mensaje del usuario
    const msgUsuario = { id: Date.now().toString(), tipo: "usuario", texto };
    setMensajes(prev => [...prev, msgUsuario]);
    setInput("");
    setCargando(true);
    
    try {
      // Llamar a la API
      const r = await asistenteAPI.enviarMensaje(texto);
      const msgIA = { 
        id: (Date.now() + 1).toString(), 
        tipo: "ia", 
        texto: r.data.respuesta, 
        categoria: r.data.categoria 
      };
      setMensajes(prev => [...prev, msgIA]);
    } catch {
      // Manejo de errores
      setMensajes(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        tipo: "ia", 
        texto: "Lo siento, hubo un problema. Por favor intentalo de nuevo." 
      }]);
    } finally {
      setCargando(false);
      setTimeout(() => listaRef.current?.scrollToEnd(), 100);
    }
  };

  // ===== RENDERIZADO DE MENSAJES =====
  const renderMensaje = ({ item }) => (
    <View style={[estilos.burbuja, item.tipo === "usuario" ? estilos.burbujaUsuario : estilos.burbujaIA]}>
      {item.tipo === "ia" && <Text style={estilos.avatarIA}>🤖</Text>}
      <View style={[estilos.burbujaContenido, item.tipo === "usuario" ? estilos.fondoUsuario : estilos.fondoIA]}>
        <Text style={[estilos.textoMensaje, item.tipo === "usuario" && { color: "#fff" }]}>{item.texto}</Text>
        {item.categoria && <Text style={estilos.categoriaTag}>{item.categoria}</Text>}
      </View>
    </View>
  );

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <KeyboardAvoidingView style={estilos.contenedor} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      
      {/* HEADER */}
      <View style={estilos.header}>
        <View style={estilos.headerFila}>
          <Text style={estilos.headerTexto}>🤖 Asistente de Bienestar</Text>
        </View>
        <Text style={estilos.headerSub}>Estoy aqui para escucharte</Text>
      </View>

      {/* LISTA DE MENSAJES */}
      <FlatList
        ref={listaRef}
        data={mensajes}
        renderItem={renderMensaje}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listaRef.current?.scrollToEnd()}
      />

      {/* INDICADOR DE ESCRITURA */}
      {cargando && (
        <View style={estilos.tipeo}>
          <View style={estilos.tipeoFila}>
            <Text style={estilos.tipeoTexto}>🤖 Escribiendo...</Text>
          </View>
        </View>
      )}

      {/* SUGERENCIAS RÁPIDAS */}
      <View style={estilos.sugerencias}>
        <FlatList
          horizontal
          data={SUGERENCIAS}
          keyExtractor={s => s}
          renderItem={({ item }) => (
            <TouchableOpacity style={estilos.chip} onPress={() => enviar(item)}>
              <Text style={estilos.chipTexto}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* INPUT Y BOTÓN ENVIAR */}
      <View style={estilos.inputRow}>
        <TextInput
          style={estilos.input}
          placeholder="Escribe como te sientes..."
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={() => enviar()}
        />
        <TouchableOpacity style={estilos.btnEnviar} onPress={() => enviar()} disabled={cargando}>
          <Text style={estilos.btnEnviarTexto}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================
// ESTILOS
// ============================================

const estilos = StyleSheet.create({
  // Contenedor principal
  contenedor: { flex: 1, backgroundColor: "transparent" },
  
  // Header
  header: { backgroundColor: COLORES.primario, padding: 20, paddingTop: 50 },
  headerFila: { flexDirection: "row", alignItems: "center" },
  headerIcono: { marginRight: 8 },
  headerTexto: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  
  // Burbujas de mensajes
  burbuja: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  burbujaUsuario: { justifyContent: "flex-end" },
  burbujaIA: { justifyContent: "flex-start" },
  avatarIA: { marginRight: 8, marginBottom: 4 },
  burbujaContenido: { maxWidth: "78%", borderRadius: 16, padding: 12 },
  fondoIA: { backgroundColor: "#fff", borderBottomLeftRadius: 4, elevation: 1 },
  fondoUsuario: { backgroundColor: COLORES.primario, borderBottomRightRadius: 4 },
  textoMensaje: { fontSize: 14, color: "#2C3E50", lineHeight: 20 },
  categoriaTag: { fontSize: 10, color: "#999", marginTop: 4 },
  
  // Indicador de escritura
  tipeo: { paddingHorizontal: 20, paddingVertical: 4 },
  tipeoFila: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipeoTexto: { color: "#999", fontSize: 12 },
  
  // Sugerencias
  sugerencias: { paddingVertical: 8, paddingLeft: 12 },
  chip: { 
    backgroundColor: "#E8F5E9", 
    borderRadius: 20, 
    paddingHorizontal: 14, 
    paddingVertical: 7, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: "#C8E6C9" 
  },
  chipTexto: { color: COLORES.primario, fontSize: 12, fontWeight: "600" },
  
  // Input y botón
  inputRow: { 
    flexDirection: "row", 
    padding: 12, 
    backgroundColor: "#fff", 
    alignItems: "flex-end", 
    borderTopWidth: 1, 
    borderColor: "#EEE" 
  },
  input: { 
    flex: 1, 
    borderWidth: 1.5, 
    borderColor: "#DDD", 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    fontSize: 14, 
    maxHeight: 100 
  },
  btnEnviar: { 
    backgroundColor: COLORES.primario, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: "center", 
    alignItems: "center", 
    marginLeft: 10 
  },
  btnEnviarTexto: { color: "#fff", fontSize: 18 },
});