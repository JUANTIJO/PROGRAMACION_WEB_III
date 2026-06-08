import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const COLORES = {
  primario: "#2D6A4F",
  secundario: "#52B788",
  fondo: "transparent",
  texto: "#2C3E50",
  error: "#E74C3C",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function RegistroScreen({ navigation }) {
  // ===== ESTADOS =====
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("paciente");
  const [cargando, setCargando] = useState(false);

  // ===== FUNCIÓN DE REGISTRO =====
  const handleRegistro = async () => {
    // Validación de campos requeridos
    if (!nombre || !apellido || !correo || !contrasena) {
      return Alert.alert("Error", "Completa todos los campos requeridos");
    }
    
    setCargando(true);
    try {
      const r = await authAPI.registro({ 
        nombre, 
        apellido, 
        correo, 
        contrasena, 
        rol 
      });
      
      // Guardar token y usuario
      await SecureStore.setItemAsync("token", r.data.token);
      await SecureStore.setItemAsync("usuario", JSON.stringify(r.data.usuario));
      
      Alert.alert("Éxito", "Cuenta creada correctamente");
      navigation.replace("Home");
    } catch (err) {
      Alert.alert("Error de registro", err.response?.data?.error || "No se pudo crear la cuenta");
    } finally {
      setCargando(false);
    }
  };

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <ImageBackground
      source={require("../../assets/images/log_reg.png")}
      style={estilos.imagenFondo}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={estilos.contenedor} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={estilos.scroll}>
          
          {/* HEADER */}
          <View style={estilos.encabezado}>
            <Text style={estilos.emoji}>👤</Text>
            <Text style={estilos.titulo}>Crear Cuenta</Text>
            <Text style={estilos.subtitulo}>Registra tus datos para comenzar</Text>
          </View>

          {/* FORMULARIO DE REGISTRO */}
          <View style={estilos.formulario}>
            
            {/* Campo: Nombre */}
            <Text style={estilos.etiqueta}>Nombre</Text>
            <TextInput 
              style={estilos.input} 
              placeholder="Tu nombre" 
              value={nombre} 
              onChangeText={setNombre} 
            />

            {/* Campo: Apellido */}
            <Text style={estilos.etiqueta}>Apellido</Text>
            <TextInput 
              style={estilos.input} 
              placeholder="Tu apellido" 
              value={apellido} 
              onChangeText={setApellido} 
            />

            {/* Campo: Correo */}
            <Text style={estilos.etiqueta}>Correo electronico</Text>
            <TextInput 
              style={estilos.input} 
              placeholder="tu@correo.com" 
              value={correo} 
              onChangeText={setCorreo} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />

            {/* Campo: Contraseña */}
            <Text style={estilos.etiqueta}>Contraseña</Text>
            <TextInput 
              style={estilos.input} 
              placeholder="Tu contraseña" 
              value={contrasena} 
              onChangeText={setContrasena} 
              secureTextEntry 
            />

            {/* Selector de Rol */}
            <Text style={estilos.etiqueta}>Rol</Text>
            <View style={estilos.rolContainer}>
              {["paciente", "familiar"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[estilos.rolBoton, rol === r && estilos.rolActivo]}
                  onPress={() => setRol(r)}
                >
                  <Text style={[estilos.rolTexto, rol === r && estilos.rolTextoActivo]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón de registro */}
            <TouchableOpacity 
              style={[estilos.boton, cargando && estilos.botonDeshabilitado]} 
              onPress={handleRegistro} 
              disabled={cargando}
            >
              {cargando ? 
                <ActivityIndicator color="#fff" /> : 
                <Text style={estilos.textoBoton}>Registrarse</Text>
              }
            </TouchableOpacity>

            {/* Link a inicio de sesión */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={estilos.linkRegistro}>
                Ya tienes cuenta? <Text style={estilos.linkDestacado}>Inicia sesion aqui</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// ============================================
// ESTILOS
// ============================================

const estilos = StyleSheet.create({
  // Fondo e imagen
  imagenFondo: { flex: 1, width: "100%" },
  contenedor: { flex: 1, backgroundColor: "transparent" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  
  // Encabezado
  encabezado: { alignItems: "center", marginBottom: 30 },
  emoji: { fontSize: 48, marginBottom: 8 },
  titulo: { fontSize: 28, fontWeight: "800", color: COLORES.primario },
  subtitulo: { fontSize: 14, color: "#666", marginTop: 4, textAlign: "center" },
  
  // Formulario
  formulario: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 24, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    elevation: 3 
  },
  etiqueta: { fontSize: 14, fontWeight: "600", color: COLORES.texto, marginBottom: 6 },
  input: { 
    borderWidth: 1.5, 
    borderColor: "#E0E0E0", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 16, 
    color: COLORES.texto 
  },
  
  // Selector de rol
  rolContainer: { flexDirection: "row", gap: 8, marginBottom: 16 },
  rolBoton: { 
    flex: 1, 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: "#E0E0E0", 
    alignItems: "center" 
  },
  rolActivo: { backgroundColor: COLORES.primario, borderColor: COLORES.primario },
  rolTexto: { fontSize: 14, color: "#666" },
  rolTextoActivo: { color: "#fff", fontWeight: "600" },
  
  // Botones
  boton: { 
    backgroundColor: COLORES.primario, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 8 
  },
  botonDeshabilitado: { opacity: 0.6 },
  textoBoton: { color: "#fff", fontSize: 16, fontWeight: "700" },
  
  // Links
  linkRegistro: { textAlign: "center", color: "#666", marginTop: 16, fontSize: 14 },
  linkDestacado: { color: COLORES.primario, fontWeight: "700" },
});