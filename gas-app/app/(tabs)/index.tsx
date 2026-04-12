import React, { useEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import mqtt from "mqtt";
import * as Linking from "expo-linking";

export default function Index() {

  const [alerta, setAlerta] = useState(false);
  const [tempo, setTempo] = useState(15);
  const [status, setStatus] = useState("Conectando...");

  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<any>(null);

  // 🔥 CONECTA MQTT (UMA VEZ SÓ)
  useEffect(() => {

    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    clientRef.current = client;

    client.on("connect", () => {
      setStatus("🟢 Conectado");
      client.subscribe("casa/gas/alerta");
    });

    client.on("error", () => {
      setStatus("🔴 Erro de conexão");
    });

    client.on("message", (topic: string, message: Buffer) => {

      const msg = message.toString();
      console.log("MQTT:", msg);

      if (topic === "casa/gas/alerta") {

        if (msg === "1" && !alerta) {
          iniciarAlerta();
        }

        if (msg === "0") {
          cancelar();
        }

      }

    });

    return () => {
      client.end();
    };

  }, []);

  // 🚨 INICIA ALERTA
  const iniciarAlerta = () => {

    // evita múltiplos timers
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    setAlerta(true);
    setTempo(15);

    let t = 15;

    intervaloRef.current = setInterval(() => {

      t--;
      setTempo(t);

      if (t <= 0 && intervaloRef.current) {
        clearInterval(intervaloRef.current);
        Linking.openURL("tel:193");
      }

    }, 1000);
  };

  // ❌ CANCELA ALERTA
  const cancelar = () => {

    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    setAlerta(false);
    setTempo(15);
  };

  return (
    <View style={[styles.container, alerta && styles.alertBackground]}>

      {/* STATUS MQTT */}
      <Text style={styles.status}>{status}</Text>

      {!alerta && (
        <View style={styles.cardSafe}>
          <Text style={styles.icon}>🛡️</Text>
          <Text style={styles.safeTitle}>Ambiente Seguro</Text>
          <Text style={styles.safeSubtitle}>
            Nenhum vazamento detectado
          </Text>
        </View>
      )}

      {alerta && (
        <View style={styles.cardAlert}>
          
          <Text style={styles.alertIcon}>🚨</Text>

          <Text style={styles.alertTitle}>
            Vazamento Detectado
          </Text>

          <Text style={styles.timer}>
            {tempo}s
          </Text>

          <Text style={styles.alertText}>
            Ligando para emergência...
          </Text>

          <TouchableOpacity style={styles.button} onPress={cancelar}>
            <Text style={styles.buttonText}>CANCELAR</Text>
          </TouchableOpacity>

        </View>
      )}

    </View>
  );
}

// 🎨 ESTILO
const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2"
  },

  alertBackground: {
    backgroundColor: "#330000"
  },

  status: {
    position: "absolute",
    top: 50,
    fontSize: 14,
    color: "#555"
  },

  // SAFE
  cardSafe: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5
  },

  icon: {
    fontSize: 50,
    marginBottom: 10
  },

  safeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71"
  },

  safeSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 5
  },

  // ALERT
  cardAlert: {
    backgroundColor: "#ff4d4d",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "80%"
  },

  alertIcon: {
    fontSize: 50,
    marginBottom: 10
  },

  alertTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white"
  },

  timer: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
    marginVertical: 10
  },

  alertText: {
    color: "white",
    marginBottom: 20
  },

  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center"
  },

  buttonText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16
  }

});