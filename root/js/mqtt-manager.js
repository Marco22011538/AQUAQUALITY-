import { 
    doc, 
    getDoc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app, db } from './firebase-app.js';

const auth = getAuth(app);

class MQTTManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.mqttClient = null;
        this.isConnected = false;
        this.init();
    }

    async init() {
        console.log("🚀 Iniciando MQTT Manager...");
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                console.log("✅ Usuario autenticado:", user.uid);
                await this.loadUserData();
                this.setupTopicUI();
                this.setupMQTT();
            } else {
                console.log("❌ Usuario no autenticado");
            }
        });
    }

    async loadUserData() {
        try {
            const userDoc = await getDoc(doc(db, "usuarios", this.currentUser.uid));
            if (userDoc.exists()) {
                this.userData = userDoc.data();
                console.log("✅ Datos de usuario cargados:", this.userData);
            } else {
                console.log("❌ No se encontraron datos del usuario");
            }
        } catch (error) {
            console.error("❌ Error cargando datos del usuario:", error);
        }
    }

    setupTopicUI() {
        const topicInput = document.getElementById('edit-topic');
        
        if (topicInput) {
            // Si el usuario ya tiene un topic, usarlo. Si no, usar QUIVALDITEZO por defecto
            const currentTopic = this.userData?.mqttTopic || "QUIVALDITEZO";
            topicInput.value = currentTopic;
            
            console.log("🎯 Topic configurado:", currentTopic);
            
            // Mostrar topic actual en el header si existe el elemento
            const currentTopicElement = document.getElementById('current-topic');
            if (currentTopicElement) {
                currentTopicElement.textContent = currentTopic;
            }
            
            // Cuando cambie el topic, actualizar
            topicInput.addEventListener('change', () => {
                console.log("📝 Topic cambiado:", topicInput.value);
                this.updateUserTopic(topicInput.value);
            });
        } else {
            console.log("⚠️ No se encontró el campo edit-topic en el HTML");
        }
    }

    async updateUserTopic(topic) {
        try {
            const userDocRef = doc(db, "usuarios", this.currentUser.uid);
            await updateDoc(userDocRef, {
                mqttTopic: topic
            });
            
            this.userData.mqttTopic = topic;
            
            // Actualizar display del topic
            const currentTopicElement = document.getElementById('current-topic');
            if (currentTopicElement) {
                currentTopicElement.textContent = topic;
            }
            
            // Reconectar con el nuevo topic
            this.setupMQTT();
            
            console.log("✅ Topic actualizado en Firestore:", topic);
            
        } catch (error) {
            console.error("❌ Error actualizando topic:", error);
        }
    }

    setupMQTT() {
        // Usar el topic del usuario, o QUIVALDITEZO por defecto (tu Arduino)
        const topic = this.userData?.mqttTopic || "QUIVALDITEZO";
        
        console.log("🔌 Configurando MQTT con topic:", topic);

        // Si ya hay un cliente, desconectarlo
        if (this.mqttClient) {
            console.log("🔄 Desconectando cliente MQTT anterior...");
            this.mqttClient.end();
        }

        const clientId = `aquaquality_${this.currentUser.uid}_${Math.random().toString(16).substring(2, 8)}`;
        const host = 'broker.hivemq.com';
        const port = 8884; // WebSocket con SSL

        console.log("🔗 Conectando a:", host, "con clientId:", clientId);

        try {
            this.mqttClient = new Paho.MQTT.Client(host, Number(port), clientId);

            // Callback cuando se pierde la conexión
            this.mqttClient.onConnectionLost = (responseObject) => {
                console.log("❌ Conexión MQTT perdida:", responseObject.errorMessage);
                this.isConnected = false;
                this.updateConnectionStatus();
            };

            // Callback cuando llega un mensaje
            this.mqttClient.onMessageArrived = (message) => {
                console.log("📨 Mensaje MQTT recibido en topic:", message.destinationName);
                console.log("📊 Contenido:", message.payloadString);
                this.handleMQTTMessage(message);
            };

            // Opciones de conexión
            const options = {
                onSuccess: () => {
                    console.log("✅ Conectado exitosamente a MQTT broker");
                    this.isConnected = true;
                    this.updateConnectionStatus();
                    
                    // Suscribirse al topic
                    this.mqttClient.subscribe(topic);
                    console.log("✅ Suscrito al topic:", topic);
                    
                    this.showAlert("Conectado a MQTT", "success");
                },
                onFailure: (error) => {
                    console.error("❌ Error conectando a MQTT:", error);
                    this.isConnected = false;
                    this.updateConnectionStatus();
                    this.showAlert("Error conectando a MQTT", "danger");
                },
                useSSL: true,
                timeout: 3,
                keepAliveInterval: 60,
                cleanSession: true
            };

            // Conectar
            this.mqttClient.connect(options);

        } catch (error) {
            console.error("❌ Error configurando MQTT:", error);
            this.showAlert("Error configurando MQTT: " + error.message, "danger");
        }
    }

    handleMQTTMessage(message) {
        try {
            const data = JSON.parse(message.payloadString);
            console.log("🎯 Datos MQTT procesados:", data);
            
            // Actualizar dashboard con los datos del Arduino
            this.updateDashboardWithMQTTData(data);
            
        } catch (error) {
            console.error("❌ Error procesando mensaje MQTT:", error);
            console.error("Mensaje raw:", message.payloadString);
        }
    }

    updateDashboardWithMQTTData(data) {
        // ✅ COMPATIBLE CON FORMATO ARDUINO: temp, hum, tds, ph
        const elements = {
            'tds-value': data.tds || data.TDS || '--',           // ← PRIORIDAD: Arduino (tds)
            'ph-value': data.ph || data.PH || '--',              // ← PRIORIDAD: Arduino (ph)  
            'temp-value': data.temp || data.Temperatura || '--', // ← PRIORIDAD: Arduino (temp)
            'hum-value': data.hum || data.Humedad || '--'        // ← PRIORIDAD: Arduino (hum)
        };

        console.log("📈 Actualizando dashboard con:", elements);

        // Actualizar cada métrica en el dashboard
        for (const [elementId, value] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
                console.log(`✅ ${elementId}: ${value}`);
            } else {
                console.log(`⚠️ Elemento no encontrado: ${elementId}`);
            }
        }

        // Actualizar timestamp
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            lastUpdate.textContent = `Última actualización: ${new Date().toLocaleString()}`;
        }

        // 🆕 PASO 3.2: GUARDAR REGISTRO AUTOMÁTICAMENTE CUANDO LLEGAN DATOS MQTT
        this.guardarRegistroMQTT(data);

        // Mostrar notificación de nuevo dato
        this.showNewDataNotification();
    }

    // 🆕 PASO 3.2: MÉTODO PARA GUARDAR REGISTROS AUTOMÁTICAMENTE
    guardarRegistroMQTT(data) {
        if (window.historialManager) {
            const registroData = {
                ID_Station: 1, // Puedes cambiar esto según tu Arduino
                Latitud: 20.1889, // Latitud por defecto de tu JSON
                Longitud: -99.2742, // Longitud por defecto de tu JSON
                TDS: data.tds || data.TDS,
                PH: data.ph || data.PH,
                Temperatura: data.temp || data.Temperatura,
                Humedad: data.hum || data.Humedad,
                Fecha: new Date().toISOString().split('T')[0], // Fecha actual
                Hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            };
            
            console.log("💾 Guardando registro automáticamente:", registroData);
            window.historialManager.guardarRegistro(registroData);
        } else {
            console.log("⚠️ Historial Manager no disponible para guardar registro");
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('mqtt-status');
        if (statusElement) {
            statusElement.textContent = this.isConnected ? 'Conectado' : 'Desconectado';
            statusElement.className = this.isConnected ? 'badge bg-success' : 'badge bg-danger';
            console.log("📡 Estado MQTT:", this.isConnected ? 'Conectado' : 'Desconectado');
        }
    }

    showNewDataNotification() {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        notification.style.zIndex = '1060';
        notification.innerHTML = `
            <i class="bi bi-broadcast me-2"></i>
            <strong>¡Nuevos datos!</strong> Recibidos via MQTT
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        console.log("🔔 Notificación mostrada: Nuevos datos MQTT");
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '1060';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Función global para generar topic aleatorio
window.generateRandomTopic = function() {
    const mqttManager = window.mqttManager;
    if (mqttManager && mqttManager.currentUser) {
        const randomId = Math.random().toString(36).substring(2, 8);
        const newTopic = `aquaquality/${mqttManager.currentUser.uid.substring(0, 8)}/${randomId}`;
        
        const topicInput = document.getElementById('edit-topic');
        if (topicInput) {
            topicInput.value = newTopic;
            mqttManager.updateUserTopic(newTopic);
        }
    }
};

// 🆕 PASO 3.3: FUNCIÓN GLOBAL PARA IMPORTAR JSON DE PRUEBA
window.importarDatosPrueba = function() {
    const datosPrueba = [
        {
            "ID_Station": 1,
            "Latitud": 20.1889,
            "Longitud": -99.2742,
            "Hora": "08:00",
            "Fecha": "2025-10-10",
            "TDS": 124.76,
            "PH": 7.44,
            "Temperatura": 22.2,
            "Humedad": 51.8
        },
        {
            "ID_Station": 2,
            "Latitud": 20.2262,
            "Longitud": -99.2149,
            "Hora": "08:00",
            "Fecha": "2025-10-10",
            "TDS": 82.36,
            "PH": 7.39,
            "Temperatura": 19.7,
            "Humedad": 77.0
        },
        {
            "ID_Station": 1,
            "Latitud": 20.1889,
            "Longitud": -99.2742,
            "Hora": "09:00",
            "Fecha": "2025-10-10",
            "TDS": 118.83,
            "PH": 7.25,
            "Temperatura": 31.0,
            "Humedad": 73.8
        },
        {
            "ID_Station": 2,
            "Latitud": 20.2262,
            "Longitud": -99.2149,
            "Hora": "09:00",
            "Fecha": "2025-10-10",
            "TDS": 109.27,
            "PH": 7.59,
            "Temperatura": 30.4,
            "Humedad": 50.3
        },
        {
            "ID_Station": 1,
            "Latitud": 20.1889,
            "Longitud": -99.2742,
            "Hora": "10:00",
            "Fecha": "2025-10-10",
            "TDS": 126.77,
            "PH": 7.45,
            "Temperatura": 31.7,
            "Humedad": 81.4
        }
    ];

    if (window.historialManager) {
        console.log("📥 Importando datos de prueba...");
        window.historialManager.importarDatosDesdeJSON(datosPrueba);
    } else {
        console.error("❌ Historial Manager no está inicializado");
        alert("Error: El sistema de historial no está cargado. Recarga la página.");
    }
};

// Inicializar MQTT Manager cuando esté en el dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🎬 Inicializando MQTT Manager...");
        window.mqttManager = new MQTTManager();
    });
}