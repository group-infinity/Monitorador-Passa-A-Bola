// --- BIBLIOTECAS E INCLUDES ---
// Biblioteca para conexão Wi-Fi no ESP32
#include <WiFi.h>
// Biblioteca para comunicação via protocolo MQTT (para o FIWARE)
#include <PubSubClient.h>
// Biblioteca para o sensor de temperatura e umidade DHT22
#include "DHT.h"
// Biblioteca para comunicação I2C (usada pelo display LCD)
#include <Wire.h>
// Biblioteca para controlar o display LCD I2C
#include <LiquidCrystal_I2C.h>

// --- CONFIGURAÇÕES DOS SENSORES E PINOS ---
// Define o tipo de sensor DHT que está sendo usado (DHT22)
#define DHTTYPE DHT22
// Pino analógico onde o potenciômetro (simulando o BPM) está conectado
const int PINO_POTENCIOMETRO = 34;
// Pino digital onde o sensor de umidade DHT22 (simulando SpO2) está conectado
const int PINO_DHT = 4;
// Pino do LED integrado do ESP32, usado para feedback de comandos
const int PINO_LED_CMD = 2;

// --- CONFIGURAÇÕES DE REDE ---
// Nome da rede Wi-Fi (SSID). Para o Wokwi, usa-se a rede de convidado.
const char* SSID = "Wokwi-GUEST";
// Senha da rede Wi-Fi. Vazia para a rede de convidado do Wokwi.
const char* PASSWORD = "";

// --- CONFIGURAÇÕES FIWARE MQTT ---
// Endereço IP do broker MQTT do FIWARE
const char* MQTT_BROKER_IP = "20.171.8.213";
// Porta padrão para comunicação MQTT
const int MQTT_PORT = 1883;
// Identificador único para este cliente MQTT. Evita conflitos no broker.
const char* MQTT_CLIENT_ID = "esp32-atleta-monitor-01";
// Tópico MQTT onde os dados dos sensores (atributos) serão publicados
const char* MQTT_TOPIC_PUBLISH = "/TEF/atleta0001/attrs";
// Tópico MQTT que o ESP32 vai "escutar" para receber comandos
const char* MQTT_TOPIC_SUBSCRIBE = "/TEF/atleta0001/cmd";

// --- OBJETOS GLOBAIS ---
// Cria o objeto 'dht' para interagir com o sensor DHT22
DHT dht(PINO_DHT, DHTTYPE);
// Cria o objeto 'wifiClient' para a conexão de rede
WiFiClient wifiClient;
// Cria o objeto 'mqttClient' associado ao cliente Wi-Fi para comunicação MQTT
PubSubClient mqttClient(wifiClient);
// Cria o objeto 'lcd' para controlar o display LCD I2C no endereço 0x27, com 20 colunas e 4 linhas
LiquidCrystal_I2C lcd(0x27, 20, 4);

// --- ÍCONES PERSONALIZADOS PARA O LCD ---
// Desenha um ícone de coração (byte array)
byte heart[8] = {0b00000, 0b01010, 0b11111, 0b11111, 0b01110, 0b00100, 0b00000, 0b00000};
// Desenha um ícone de pulmão (saturação) (byte array)
byte lung[8] =  {0b01010, 0b11011, 0b11111, 0b01110, 0b01110, 0b11111, 0b11011, 0b01010};


/**
 * @brief Função chamada automaticamente quando uma mensagem é recebida em um tópico inscrito.
 * @param topic O tópico onde a mensagem foi publicada.
 * @param payload A mensagem recebida (em bytes).
 * @param length O tamanho da mensagem.
 */
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
    String msg;
    // Converte o payload de bytes para uma String
    for (int i = 0; i < length; i++) {
        msg += (char)payload[i];
    }
    Serial.println("<- Mensagem recebida: " + msg);

    // Verifica se a mensagem é um comando para piscar o LED
    if (msg.equals("atleta0001@piscar|")) {
        Serial.println("Comando 'piscar' recebido!");
        lcd.setCursor(0, 3);
        lcd.print("Comando recebido!   "); // Limpa a linha com espaços
        // Pisca o LED 5 vezes como feedback visual
        for (int i=0; i<5; i++) {
            digitalWrite(PINO_LED_CMD, HIGH);
            delay(100);
            digitalWrite(PINO_LED_CMD, LOW);
            delay(100);
        }
    }
}

/**
 * @brief Conecta o ESP32 à rede Wi-Fi configurada.
 * Fica em loop até a conexão ser estabelecida.
 */
void conectarWiFi() {
    delay(10);
    lcd.setCursor(0, 1);
    lcd.print("A ligar ao WiFi...");
    Serial.print("📡 A ligar ao WiFi...");
    
    WiFi.begin(SSID, PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ Ligado com sucesso!");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Ligado!        "); // Limpa a linha com espaços
}

/**
 * @brief Conecta ou reconecta ao broker MQTT.
 * Se a conexão falhar, espera 5 segundos antes de tentar novamente.
 */
void reconectarMQTT() {
    while (!mqttClient.connected()) {
        Serial.print("🔄 A ligar ao Broker MQTT...");
        lcd.setCursor(0, 2);
        lcd.print("A ligar ao MQTT...");
        
        // Tenta conectar com o ID de cliente definido
        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("\n✅ Ligado ao MQTT!");
            lcd.setCursor(0, 2);
            lcd.print("MQTT Ligado!          ");
            // Inscreve-se no tópico de comandos para poder receber mensagens
            mqttClient.subscribe(MQTT_TOPIC_SUBSCRIBE);
            Serial.println("-> Inscrito no tópico de comandos: " + String(MQTT_TOPIC_SUBSCRIBE));
        } else {
            Serial.print("\n❌ Falha na ligação MQTT. A tentar em 5s...");
            lcd.setCursor(0, 2);
            lcd.print("Falha no MQTT...    ");
            delay(5000);
        }
    }
}

/**
 * @brief Atualiza as informações exibidas no display LCD.
 * @param bpm O valor do batimento cardíaco.
 * @param spo2 O valor da saturação de oxigênio.
 * @param status Uma mensagem de status para a última linha.
 */
void atualizarDisplay(int bpm, float spo2, String status) {
  lcd.setCursor(0, 0);
  lcd.print("   Monitor Atleta   ");
  lcd.setCursor(0, 1);
  lcd.print("Batimento: ");
  lcd.print(bpm);
  lcd.print(" BPM ");
  lcd.write(byte(0)); // Exibe o ícone de coração
  lcd.setCursor(0, 2);
  lcd.print("Saturacao: ");
  lcd.print(spo2, 1); // Exibe com uma casa decimal
  lcd.print(" % ");
  lcd.write(byte(1)); // Exibe o ícone de pulmão
  lcd.setCursor(0, 3);
  lcd.print(status);
}


/**
 * @brief Função de configuração inicial, executada uma única vez na inicialização.
 */
void setup() {
    // Define o pino do LED como saída
    pinMode(PINO_LED_CMD, OUTPUT);
    // Inicia a comunicação serial para debug
    Serial.begin(115200);
    // Inicia o sensor DHT
    dht.begin();
    // Inicia o display LCD
    lcd.init();
    lcd.backlight();
    // Cria os caracteres personalizados no LCD
    lcd.createChar(0, heart);
    lcd.createChar(1, lung);
    lcd.setCursor(0,0);
    lcd.print("A iniciar Monitor...");

    // Conecta ao Wi-Fi e configura o cliente MQTT
    conectarWiFi();
    mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);
    mqttClient.setCallback(mqtt_callback); // Define a função que trata mensagens recebidas
    delay(1500);
    lcd.clear();
}

/**
 * @brief Loop principal do programa, executado repetidamente.
 */
void loop() {
    // Garante que o Wi-Fi esteja sempre conectado
    if (WiFi.status() != WL_CONNECTED) {
      conectarWiFi();
    }
    // Garante que o cliente MQTT esteja sempre conectado
    if (!mqttClient.connected()) {
      reconectarMQTT();
    }
    // Mantém o cliente MQTT ativo (processa mensagens recebidas, etc.)
    mqttClient.loop();

    // --- LEITURA DOS SENSORES ---
    // Lê o potenciômetro e mapeia o valor para uma faixa de BPM (60 a 180)
    int bpm = map(analogRead(PINO_POTENCIOMETRO), 0, 4095, 60, 180);
    // Lê a umidade do sensor DHT22 para simular o SpO2
    float spo2 = dht.readHumidity();
    // Se a leitura falhar (isnan) ou for irrealista, gera um valor aleatório para a simulação
    if (isnan(spo2) || spo2 < 90.0) {
      spo2 = random(950, 995) / 10.0; // Gera um valor entre 95.0 e 99.4
    }
    
    // Atualiza o display com os novos valores
    atualizarDisplay(bpm, spo2, "A enviar dados...");

    // --- PUBLICAÇÃO MQTT ---
    // Cria o payload no formato esperado pelo FIWARE (key-value pairs)
    char payload[50];
    snprintf(payload, sizeof(payload), "b|%d|s|%.1f", bpm, spo2);
    Serial.println("-> A publicar payload MQTT: " + String(payload));
    
    // Publica a mensagem no tópico de atributos
    if(mqttClient.publish(MQTT_TOPIC_PUBLISH, payload)) {
        Serial.println("✅ Mensagem publicada!");
        lcd.setCursor(0, 3);
        lcd.print("Dados enviados!     ");
    } else {
        Serial.println("❌ Falha ao publicar MQTT.");
        lcd.setCursor(0, 3);
        lcd.print("Falha no envio...   ");
    }
    
    // Espera 10 segundos antes da próxima leitura e publicação
    delay(10000);
}