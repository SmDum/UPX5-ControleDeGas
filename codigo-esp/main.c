#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // <-- ADICIONADO

// ===== WIFI =====
const char* ssid = "Sillas";
const char* password = "Sorocaba2";

// ===== MQTT =====
const char* mqtt_server = "broker.hivemq.com";

// ===== API =====
const char* serverURL = "https://gasguard-backend.onrender.com/api/sensor-data"; // <-- ATUALIZADO

// ===== PINOS =====
#define MQ2_PIN 34
#define RELAY_PIN 26

// ===== CONFIG =====
int LIMITE_GAS = 1200;
bool alertaAtivo = false;

// ===== OBJETOS =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== CONECTAR WIFI =====
void setup_wifi() {
  delay(10);
  Serial.println("Conectando WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
}

// ===== CONECTAR MQTT =====
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT...");
    if (client.connect("ESP32Gas")) {
      Serial.println(" conectado!");
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente...");
      delay(2000);
    }
  }
}

// ===== MÉDIA DO SENSOR =====
int lerMediaGas() {
  int soma = 0;
  for (int i = 0; i < 5; i++) {
    soma += analogRead(MQ2_PIN);
    delay(200);
  }
  return soma / 5;
}

// ===== ENVIAR POST =====
void enviarPOST(float nivelGasPorcentagem) {
  if (WiFi.status() == WL_CONNECTED) {

    // <-- ATUALIZADO: cliente seguro que ignora verificação SSL do Render
    WiFiClientSecure secureClient;
    secureClient.setInsecure();
    HTTPClient http;

    // Inicia a conexão usando o cliente seguro
    http.begin(secureClient, serverURL);
    http.addHeader("Content-Type", "application/json");

    // ===== JSON =====
    String json = "{";
    json += "\"id_dispositivo\":\"apt_42\",";
    json += "\"nivel_gas\":";
    json += String(nivelGasPorcentagem, 1);
    json += "}";

    Serial.println("JSON enviado:");
    Serial.println(json);

    // ===== ENVIO =====
    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println("--------------------------");
    http.end();
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  setup_wifi();

  client.setServer(mqtt_server, 1883);

  Serial.println("Aquecendo sensor...");
  delay(60000);
  Serial.println("Sistema iniciado!");
}

// ===== LOOP =====
void loop() {
  // ===== MQTT =====
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ===== LEITURA DO GÁS =====
  int gas = lerMediaGas();
  Serial.print("Nivel de gas: ");
  Serial.println(gas);

  // ===== CONVERSÃO PARA % =====
  float porcentagemGas = map(gas, 0, 4095, 0, 100);
  Serial.print("Porcentagem de gas: ");
  Serial.print(porcentagemGas);
  Serial.println("%");

  // ===== ENVIA POST =====
  enviarPOST(porcentagemGas);

  // ===== DETECÇÃO DE VAZAMENTO =====
  if (gas > LIMITE_GAS && !alertaAtivo) {
    alertaAtivo = true;
    Serial.println("VAZAMENTO DETECTADO!");
    digitalWrite(RELAY_PIN, HIGH);
    client.publish("casa/gas/alerta", "1");
    Serial.println("ALERTA ENVIADO");
  }

  // ===== VOLTA AO NORMAL =====
  if (gas < (LIMITE_GAS - 100) && alertaAtivo) {
    alertaAtivo = false;
    digitalWrite(RELAY_PIN, LOW);
    client.publish("casa/gas/alerta", "0");
    Serial.println("NORMAL ENVIADO");
  }

  delay(2000);
}