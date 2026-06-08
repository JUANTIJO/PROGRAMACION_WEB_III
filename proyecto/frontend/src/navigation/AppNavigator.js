import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ImageBackground, StyleSheet, Text } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CitasScreen from "../screens/CitasScreen";
import AsistenteScreen from "../screens/AsistenteScreen";
import EspiritualScreen from "../screens/EspiritualScreen";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import RegistroScreen from "../screens/RegistroScreen";
import MedicacionScreen from "../screens/MedicacionScreen";
import ReportesScreen from "../screens/ReportesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORES = { primario: "#2D6A4F", secundario: "#52B788" };

/* Mejora de Fuente y Grosor (Estilos): Ajustar manualmente fontWeight y fontFamily */
const TABS = [
  { name: "Inicio", component: DashboardScreen, emoji: "🏠" },
  { name: "Citas", component: CitasScreen, emoji: "📅" },
  { name: "Asistente", component: AsistenteScreen, emoji: "🤖" },
  { name: "Espiritual", component: EspiritualScreen, emoji: "✝️" },
  { name: "Estadisticas", component: EstadisticasScreen, emoji: "📊" },
];

function TabsNavigator() {
  return (
    <ImageBackground
      source={require("../../assets/images/bg_app.png")}
      style={estilos.imagenFondo}
      resizeMode="cover"
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORES.primario,
          tabBarInactiveTintColor: "#999",
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
          tabBarIcon: ({ focused }) => {
            const tab = TABS.find(t => t.name === route.name);
            return <Text style={{ fontSize: focused ? 24 : 20 }}>{tab?.emoji}</Text>;
          },
        })}
      >
        {TABS.map(t => (
          <Tab.Screen key={t.name} name={t.name} component={t.component} />
        ))}
      </Tab.Navigator>
    </ImageBackground>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="Home" component={TabsNavigator} />
        <Stack.Screen name="Medicacion">
          {(props) => (
            <ImageBackground
              source={require("../../assets/images/bg_app.png")}
              style={estilos.imagenFondo}
              resizeMode="cover"
            >
              <MedicacionScreen {...props} />
            </ImageBackground>
          )}
        </Stack.Screen>
        <Stack.Screen name="Reportes">
          {(props) => (
            <ImageBackground
              source={require("../../assets/images/bg_app.png")}
              style={estilos.imagenFondo}
              resizeMode="cover"
            >
              <ReportesScreen {...props} />
            </ImageBackground>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  imagenFondo: { flex: 1, width: "100%" },
});
