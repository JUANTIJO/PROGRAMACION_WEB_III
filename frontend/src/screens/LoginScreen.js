import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
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
  advertencia: "#F39C12",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function LoginScreen({ navigation }) {
  // ===== ESTADOS =====
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [fortaleza, setFortaleza] = useState(null);
  const [biometriaDisponible, setBiometriaDisponible] = useState(false);

  // ===== EFECTOS =====
  useEffect(() => {
    verificarBiometria();
  }, []);

  // ===== FUNCIONES DE BIOMETRÍA =====
  const verificarBiometria = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const inscrito = await LocalAuthentication.isEnrolledAsync();
    setBiometriaDisponible(compatible && inscrito);
  };

  // ===== FUNCIONES DE VALIDACIÓN =====
  const evaluarContrasena = async (valor) => {
    setContrasena(valor);
    if (valor.length > 3) {
      try {
        const r = await authAPI.verificarContrasena(valor);
        setFortaleza(r.data.nivel);
      } catch {
        // Error silencioso
      }
    }
  };

  // ===== FUNCIONES DE AUTENTICACIÓN =====
  const handleLogin = async () => {
    if (!correo || !contrasena) {
      return Alert.alert("Error", "Ingresa tu correo y contraseña");
    }
    
    setCargando(true);
    try {
      const r = await authAPI.login({ correo, contrasena });
      await SecureStore.setItemAsync("token", r.data.token);
      await SecureStore.setItemAsync("usuario", JSON.stringify(r.data.usuario));
      navigation.replace("Home");
    } catch (err) {
      Alert.alert("Error de acceso", err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  const loginConHuella = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticate con tu huella",
        fallbackLabel: "Usar contraseña",
      });
      
      if (result.success) {
        const token = await SecureStore.getItemAsync("token");
        const usuario = await SecureStore.getItemAsync("usuario");
        if (token && usuario) {
          navigation.replace("Home");
        } else {
          Alert.alert("Información", "Para usar huella, primero debes iniciar sesión manualmente con tu contraseña una vez.");
        }
      }
    } catch (err) {
      console.log("Error biometrico:", err);
    }
  };

  // ===== COLORES DINÁMICOS =====
  const colorFortaleza = { 
    debil: COLORES.error, 
    media: COLORES.advertencia, 
    fuerte: COLORES.primario 
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
            <Text style={estilos.emoji}>🏥</Text>
            <Text style={estilos.titulo}>SaludApp</Text>
            <Text style={estilos.subtitulo}>Tu compañero de salud y bienestar</Text>
          </View>

          {/* FORMULARIO DE LOGIN */}
          <View style={estilos.formulario}>
            
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
              onChangeText={evaluarContrasena}
              secureTextEntry
            />
            
            {/* Indicador de fortaleza de contraseña */}
            {fortaleza && (
              <View style={[estilos.indicadorFortaleza, { backgroundColor: colorFortaleza[fortaleza] }]}>
                <Text style={estilos.textoFortaleza}>Seguridad: {fortaleza.toUpperCase()}</Text>
              </View>
            )}

            {/* Botón de inicio de sesión */}
            <TouchableOpacity
              style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
              onPress={handleLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={estilos.textoBoton}>Iniciar sesion</Text>
              )}
            </TouchableOpacity>

            {/* Botón de autenticación biométrica */}
            {biometriaDisponible && (
              <TouchableOpacity style={estilos.botonHuella} onPress={loginConHuella}>
                <Text style={estilos.textoBotonHuella}>🖐 Usar huella dactilar</Text>
              </TouchableOpacity>
            )}

            {/* Link a registro */}
            <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
              <Text style={estilos.linkRegistro}>
                No tienes cuenta? <Text style={estilos.linkDestacado}>Registrate aqui</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* VERSÍCULO INSPIRADOR */}
          <Text style={estilos.versiculo}>
            "Todo lo puedo en Cristo que me fortalece" ✝️ Filipenses 4:13
          </Text>
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
  encabezado: { alignItems: "center", marginBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 8 },
  titulo: { fontSize: 40, fontWeight: "800", color: COLORES.primario },
  subtitulo: { 
    fontSize: 16, 
    color: "#72597c", 
    marginTop: 4, 
    textAlign: "center",
    fontWeight: "bold" 
  },
  
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
  
  // Indicador de fortaleza
  indicadorFortaleza: { padding: 6, borderRadius: 6, marginBottom: 12, alignItems: "center" },
  textoFortaleza: { color: "#fff", fontSize: 12, fontWeight: "700" },
  
  // Botones
  boton: { 
    backgroundColor: COLORES.primario, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 8 
  },
  botonDeshabilitado: { opacity: 0.6 },
  textoBoton: { color: "#f8f6e0", fontSize: 16, fontWeight: "700" },
  
  // Botón biométrico
  botonHuella: { 
    backgroundColor: "#E8F5E9", 
    padding: 14, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: COLORES.primario, 
    flexDirection: "row", 
    justifyContent: "center" 
  },
  textoBotonHuella: { color: COLORES.primario, fontSize: 16, fontWeight: "700" },
  
  // Links
  linkRegistro: { textAlign: "center", color: "#666", marginTop: 16, fontSize: 14 },
  linkDestacado: { color: COLORES.primario, fontWeight: "700" },
  
  // Versículo
  versiculo: { 
    textAlign: "center", 
    color: "#3a14e6", 
    fontSize: 14, 
    marginTop: 32, 
    fontStyle: "italic", 
    fontWeight: "bold" 
  },
});