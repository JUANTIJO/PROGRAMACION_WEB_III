import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
  TextInput, Alert, ActivityIndicator
} from "react-native";
import { citasAPI } from "../services/api";

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const COLORES = {
  primario: "#2D6A4F", 
  fondo: "#F0F7F4",
  pendiente: "#FFF3E0", 
  completada: "#E8F5E9", 
  perdida: "#FFEBEE"
};

const ESTADO_COLOR = { 
  pendiente: "#F59E0B", 
  completada: "#10B981", 
  perdida: "#EF4444", 
  cancelada: "#6B7280" 
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CitasScreen() {
  // ===== ESTADOS =====
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);
  const [form, setForm] = useState({ 
    titulo: "", 
    doctor: "", 
    especialidad: "", 
    fecha_hora: "", 
    ubicacion: "", 
    notas: "" 
  });

  // ===== FUNCIONES DE API =====
  const cargarCitas = async () => {
    try {
      const r = await citasAPI.listar();
      setCitas(r.data.citas);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar las citas");
    } finally {
      setCargando(false);
    }
  };

  // ===== EFECTOS =====
  useEffect(() => { 
    cargarCitas(); 
  }, []);

  // ===== FUNCIONES DEL MODAL =====
  const abrirModal = (cita = null) => {
    setCitaEditando(cita);
    setForm(cita || { 
      titulo: "", 
      doctor: "", 
      especialidad: "", 
      fecha_hora: "", 
      ubicacion: "", 
      notas: "" 
    });
    setModalVisible(true);
  };

  // ===== FUNCIONES CRUD =====
  const guardar = async () => {
    if (!form.titulo || !form.fecha_hora) {
      return Alert.alert("Error", "Titulo y fecha son obligatorios");
    }
    
    try {
      if (citaEditando) {
        await citasAPI.actualizar(citaEditando.id, form);
        Alert.alert("Exito", "Cita actualizada");
      } else {
        await citasAPI.crear(form);
        Alert.alert("Exito", "Cita creada");
      }
      setModalVisible(false);
      cargarCitas();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Error al guardar");
    }
  };

  const eliminar = (id) => {
    Alert.alert("Eliminar cita", "Esta seguro? La cita se marcara como inactiva.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", 
        style: "destructive",
        onPress: async () => { 
          await citasAPI.eliminar(id); 
          cargarCitas(); 
        }
      }
    ]);
  };

  // ===== RENDERIZADO DE CADA CITA =====
  const renderCita = ({ item }) => (
    <View style={[estilos.citaCard, { borderLeftColor: ESTADO_COLOR[item.estado] }]}>
      {/* Encabezado: Título y Estado */}
      <View style={estilos.citaEncabezado}>
        <Text style={estilos.citaTitulo}>{item.titulo}</Text>
        <View style={[estilos.estadoBadge, { backgroundColor: ESTADO_COLOR[item.estado] }]}>
          <Text style={estilos.estadoTexto}>{item.estado.toUpperCase()}</Text>
        </View>
      </View>
      
      {/* Información del Doctor */}
      <View style={estilos.citaDoctorFila}>
        <Text>🩺 {item.doctor} - {item.especialidad}</Text>
      </View>
      
      {/* Fecha y Hora */}
      <View style={estilos.citaFechaFila}>
        <Text>📅 {new Date(item.fecha_hora).toLocaleString("es-ES")}</Text>
      </View>
      
      {/* Ubicación (condicional) */}
      {item.ubicacion && (
        <View style={estilos.citaUbicFila}>
          <Text>📍 {item.ubicacion}</Text>
        </View>
      )}
      
      {/* Botones de Acción */}
      <View style={estilos.acciones}>
        <TouchableOpacity style={estilos.btnEditar} onPress={() => abrirModal(item)}>
          <View style={estilos.accionFila}>
            <Text style={estilos.btnTexto}>✏️ Editar</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.btnEliminar} onPress={() => eliminar(item.id)}>
          <View style={estilos.accionFila}>
            <Text style={estilos.btnTexto}>🗑️ Eliminar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ===== RENDERIZADO PRINCIPAL =====
  return (
    <View style={estilos.contenedor}>
      
      {/* HEADER */}
      <View style={estilos.header}>
        <View style={estilos.headerTituloFila}>
          <Text style={estilos.titulo}>📅 Mis Citas Medicas</Text>
        </View>
        <TouchableOpacity style={estilos.btnNueva} onPress={() => abrirModal()}>
          <Text style={estilos.btnNuevaTexto}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE CITAS O INDICADOR DE CARGA */}
      {cargando ? (
        <ActivityIndicator size="large" color={COLORES.primario} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={estilos.vacio}>No tienes citas registradas</Text>}
        />
      )}

      {/* MODAL PARA CREAR/EDITAR CITA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            
            {/* Título del Modal */}
            <Text style={estilos.modalTitulo}>
              {citaEditando ? "Editar Cita" : "Nueva Cita"}
            </Text>
            
            {/* Campos del Formulario */}
            {[
              { campo: "titulo", placeholder: "Titulo de la cita", label: "Titulo *" },
              { campo: "doctor", placeholder: "Nombre del doctor", label: "Doctor" },
              { campo: "especialidad", placeholder: "Ej: Cardiologia", label: "Especialidad" },
              { campo: "fecha_hora", placeholder: "YYYY-MM-DD HH:MM", label: "Fecha y hora *" },
              { campo: "ubicacion", placeholder: "Hospital o clinica", label: "Ubicacion" },
              { campo: "notas", placeholder: "Notas adicionales", label: "Notas" },
            ].map(({ campo, placeholder, label }) => (
              <View key={campo}>
                <Text style={estilos.etiqueta}>{label}</Text>
                <TextInput
                  style={estilos.input}
                  placeholder={placeholder}
                  value={form[campo]}
                  onChangeText={(v) => setForm({ ...form, [campo]: v })}
                  multiline={campo === "notas"}
                />
              </View>
            ))}
            
            {/* Botones del Modal */}
            <View style={estilos.modalAcciones}>
              <TouchableOpacity style={estilos.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#555", fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.btnGuardar} onPress={guardar}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================

const estilos = StyleSheet.create({
  // Contenedor principal
  contenedor: { flex: 1, backgroundColor: "transparent" },
  
  // Header
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16, 
    backgroundColor: COLORES.primario, 
    paddingTop: 50 
  },
  headerTituloFila: { flexDirection: "row", alignItems: "center" },
  headerIcono: { marginRight: 8 },
  titulo: { fontSize: 20, fontWeight: "800", color: "#fff" },
  btnNueva: { 
    backgroundColor: "rgba(255,255,255,0.2)", 
    borderRadius: 8, 
    paddingHorizontal: 14, 
    paddingVertical: 8 
  },
  btnNuevaTexto: { color: "#fff", fontWeight: "700" },
  
  // Tarjeta de cada cita
  citaCard: { 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    borderLeftWidth: 4, 
    elevation: 2 
  },
  citaEncabezado: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 6 
  },
  citaTitulo: { fontSize: 16, fontWeight: "700", color: "#2C3E50", flex: 1 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  estadoTexto: { color: "#fff", fontSize: 10, fontWeight: "800" },
  
  // Estilos de texto informativo (corregidos)
  citaDoctorFila: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  citaFechaFila: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  citaUbicFila: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  
  // Botones de acción
  acciones: { flexDirection: "row", marginTop: 12, gap: 8 },
  accionFila: { flexDirection: "row", alignItems: "center", gap: 4 },
  btnEditar: { backgroundColor: "#E3F2FD", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnEliminar: { backgroundColor: "#FFEBEE", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnTexto: { fontSize: 13, fontWeight: "600" },
  
  // Estado vacío
  vacio: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 16 },
  
  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "flex-end" 
  },
  modalContenido: { 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 24, 
    maxHeight: "90%" 
  },
  modalTitulo: { fontSize: 20, fontWeight: "800", color: "#2C3E50", marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 4 },
  input: { 
    borderWidth: 1.5, 
    borderColor: "#E0E0E0", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 14, 
    marginBottom: 12 
  },
  modalAcciones: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnCancelar: { 
    flex: 1, 
    borderWidth: 1.5, 
    borderColor: "#DDD", 
    borderRadius: 10, 
    padding: 14, 
    alignItems: "center" 
  },
  btnGuardar: { 
    flex: 1, 
    backgroundColor: COLORES.primario, 
    borderRadius: 10, 
    padding: 14, 
    alignItems: "center" 
  },
});