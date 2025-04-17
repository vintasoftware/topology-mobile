import { Ionicons } from "@expo/vector-icons";
import { BaseClient } from "@TopologyHealth/smarterfhir";
import { Tabs } from "expo-router";
import { useState } from "react";

import { PatientProvider } from "../context/PatientContext";
import { SmarterFhirContext } from "../context/SmarterFhirContext";

export default function TabLayout() {
  const [client, setClient] = useState<BaseClient | null>(null);

  const logout = () => {
    setClient(null);
  };

  return (
    <SmarterFhirContext.Provider value={{ client, setClient, logout }}>
      <PatientProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "#8E8E93",
            tabBarStyle: {
              backgroundColor: "#25292e",
              borderTopWidth: 1,
              borderTopColor: "#3a3a3a",
            },
            headerStyle: {
              backgroundColor: "#25292e",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              color: "#fff",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "Chat",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubble-ellipses"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </PatientProvider>
    </SmarterFhirContext.Provider>
  );
}
