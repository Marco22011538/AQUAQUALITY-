import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    query, 
    where,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    addDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app, db } from './firebase-app.js';

const auth = getAuth(app);

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.userStation = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupLogout();
        this.setupGlobalFunctions();
    }

    async checkAuth() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadOrCreateUserData();
                await this.loadOrCreateStation();
                this.setupProfileEdit();
                this.setupRealTimeUpdates();
                this.updateUI();
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    async loadOrCreateUserData() {
        try {
            const userDocRef = doc(db, "usuarios", this.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                this.userData = userDoc.data();
                this.userStation = this.userData.id_station;
                console.log("✅ Usuario cargado:", this.userData);
            } else {
                await this.createNewUser(userDocRef);
            }
        } catch (error) {
            console.error("Error cargando usuario:", error);
        }
    }

    async createNewUser(userDocRef) {
        const userData = {
            nombre: this.currentUser.displayName || "Usuario",
            email: this.currentUser.email,
            ciudad: "Sin especificar",
            id_station: null,
            fecha_registro: new Date()
        };
        
        await setDoc(userDocRef, userData);
        this.userData = userData;
        console.log("✅ Nuevo usuario creado:", userData);
    }

    async loadOrCreateStation() {
        if (this.userData && this.userData.id_station) {
            this.userStation = this.userData.id_station;
            document.getElementById('station-id').textContent = this.userStation;
            console.log("✅ Estación existente:", this.userStation);
        } else {
            await this.createNewStation();
        }
    }

    async createNewStation() {
        try {
            const stationId = Date.now();
            const stationRef = doc(db, "estaciones", stationId.toString());
            
            const stationData = {
                userId: this.currentUser.uid,
                ubicacion: "Sin ubicación",
                ultima_actualizacion: new Date(),
            };
            
            await setDoc(stationRef, stationData);
            
            const userDocRef = doc(db, "usuarios", this.currentUser.uid);
            await updateDoc(userDocRef, { 
                id_station: stationId 
            });
            
            this.userStation = stationId;
            this.userData.id_station = stationId;
            document.getElementById('station-id').textContent = stationId;
            
            console.log("✅ Nueva estación creada:", stationId);
        } catch (error) {
            console.error("Error creando estación:", error);
        }
    }

    setupRealTimeUpdates() {
        console.log("🔍 Iniciando monitoreo en tiempo real desde colección 'registros'");

        try {
            const registrosRef = collection(db, "registros");
            
            const q = query(
                registrosRef, 
                where("ID_Station", "==", this.userStation),
                orderBy("timestamp", "desc"), 
                limit(1)
            );
            
            onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const latestData = snapshot.docs[0].data();
                    console.log("📊 Nuevos datos recibidos de registros:", latestData);
                    this.updateDashboard(latestData);
                } else {
                    console.log("ℹ️ No hay datos en 'registros' para esta estación");
                    this.updateDashboard({
                        TDS: 0,
                        PH: 0,
                        Temperatura: 0,
                        Humedad: 0,
                        timestamp: new Date()
                    });
                }
            }, (error) => {
                console.error("❌ Error en monitoreo tiempo real:", error);
                
                if (error.code === 'failed-precondition') {
                    console.log("🔄 Usando método alternativo (índice en creación)...");
                    this.setupRealTimeUpdatesFallback();
                }
            });
        } catch (error) {
            console.error("❌ Error configurando monitoreo:", error);
            this.setupRealTimeUpdatesFallback();
        }
    }

    setupRealTimeUpdatesFallback() {
        console.log("🔄 Usando método alternativo de monitoreo...");
        
        const registrosRef = collection(db, "registros");
        const q = query(registrosRef, orderBy("timestamp", "desc"), limit(10));
        
        onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const allRecords = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                const userRecord = allRecords.find(record => record.ID_Station === this.userStation);
                
                if (userRecord) {
                    console.log("📊 Datos encontrados (método alternativo):", userRecord);
                    this.updateDashboard(userRecord);
                } else {
                    console.log("ℹ️ No hay datos para esta estación en los últimos registros");
                }
            }
        });
    }

    async crearRegistrosPrueba() {
        console.log("📝 Creando registros de prueba...");
        
        const datosPrueba = [
            {
                "ID_Station": this.userStation,
                "Latitud": 20.1889,
                "Longitud": -99.2742,
                "Hora": "08:00",
                "Fecha": "2025-10-10",
                "TDS": 124.76,
                "PH": 7.44,
                "Temperatura": 22.2,
                "Humedad": 51.8,
                "timestamp": new Date("2025-10-10T08:00:00")
            },
            {
                "ID_Station": this.userStation,
                "Latitud": 20.1889,
                "Longitud": -99.2742,
                "Hora": "09:00",
                "Fecha": "2025-10-10",
                "TDS": 118.83,
                "PH": 7.25,
                "Temperatura": 31.0,
                "Humedad": 73.8,
                "timestamp": new Date("2025-10-10T09:00:00")
            },
            {
                "ID_Station": this.userStation,
                "Latitud": 20.1889,
                "Longitud": -99.2742,
                "Hora": "10:00",
                "Fecha": "2025-10-10",
                "TDS": 126.77,
                "PH": 7.45,
                "Temperatura": 31.7,
                "Humedad": 81.4,
                "timestamp": new Date("2025-10-10T10:00:00")
            }
        ];

        try {
            let createdCount = 0;
            
            for (const registro of datosPrueba) {
                await addDoc(collection(db, "registros"), registro);
                createdCount++;
                console.log(`✅ Registro ${createdCount} creado para estación ${this.userStation}`);
            }
            
            this.showAlert(`¡${createdCount} registros de prueba creados exitosamente!`, 'success');
            console.log(`🎉 Total: ${createdCount} registros creados`);
            
        } catch (error) {
            console.error("❌ Error creando registros:", error);
            this.showAlert("Error creando registros: " + error.message, 'danger');
        }
    }

    setupGlobalFunctions() {
        window.crearRegistrosPrueba = () => this.crearRegistrosPrueba();
        
        window.generateRandomTopic = () => {
            const randomId = Math.random().toString(36).substring(2, 8);
            const newTopic = `aquaquality_${randomId}`;
            
            const topicInput = document.getElementById('edit-topic');
            if (topicInput) {
                topicInput.value = newTopic;
                console.log("🎯 Nuevo topic generado:", newTopic);
            }
        };

        window.importarDatosPrueba = () => {
            console.log("📥 Iniciando importación de datos de prueba...");
            if (window.mqttManager && window.mqttManager.importarDatosPrueba) {
                window.mqttManager.importarDatosPrueba();
            } else {
                alert("⚠️ MQTT Manager no está disponible. Recarga la página.");
            }
        };
    }

    async loadHistoricalData(days = 7) {
        try {
            const registrosRef = collection(db, "registros");
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const q = query(
                registrosRef,
                where("ID_Station", "==", this.userStation),
                where("timestamp", ">=", startDate),
                orderBy("timestamp", "asc")
            );
            
            const snapshot = await getDocs(q);
            const historicalData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📈 Datos históricos cargados: ${historicalData.length} registros`);
            return historicalData;
            
        } catch (error) {
            console.error("❌ Error cargando datos históricos:", error);
            return [];
        }
    }

    async loadStatistics() {
        try {
            const registrosRef = collection(db, "registros");
            const q = query(
                registrosRef,
                where("ID_Station", "==", this.userStation),
                orderBy("timestamp", "desc"),
                limit(50)
            );
            
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => doc.data());
            
            if (records.length > 0) {
                const avgTDS = (records.reduce((sum, r) => sum + (r.TDS || 0), 0) / records.length).toFixed(2);
                const avgPH = (records.reduce((sum, r) => sum + (r.PH || 0), 0) / records.length).toFixed(2);
                const avgTemp = (records.reduce((sum, r) => sum + (r.Temperatura || 0), 0) / records.length).toFixed(2);
                const avgHum = (records.reduce((sum, r) => sum + (r.Humedad || 0), 0) / records.length).toFixed(2);
                
                this.updateStatistics({ avgTDS, avgPH, avgTemp, avgHum });
                document.getElementById('total-registros-user').textContent = records.length;
            }
            
        } catch (error) {
            console.error("❌ Error cargando estadísticas:", error);
            this.loadStatisticsFallback();
        }
    }

    async loadStatisticsFallback() {
        try {
            const registrosRef = collection(db, "registros");
            const snapshot = await getDocs(registrosRef);
            const allRecords = snapshot.docs.map(doc => doc.data());
            
            const userRecords = allRecords.filter(record => record.ID_Station === this.userStation);
            
            if (userRecords.length > 0) {
                const avgTDS = (userRecords.reduce((sum, r) => sum + (r.TDS || 0), 0) / userRecords.length).toFixed(2);
                const avgPH = (userRecords.reduce((sum, r) => sum + (r.PH || 0), 0) / userRecords.length).toFixed(2);
                const avgTemp = (userRecords.reduce((sum, r) => sum + (r.Temperatura || 0), 0) / userRecords.length).toFixed(2);
                const avgHum = (userRecords.reduce((sum, r) => sum + (r.Humedad || 0), 0) / userRecords.length).toFixed(2);
                
                this.updateStatistics({ avgTDS, avgPH, avgTemp, avgHum });
                document.getElementById('total-registros-user').textContent = userRecords.length;
                
                console.log("📈 Estadísticas calculadas (método alternativo):", { avgTDS, avgPH, avgTemp, avgHum });
            }
            
        } catch (error) {
            console.error("❌ Error en método alternativo de estadísticas:", error);
        }
    }

    updateStatistics(stats) {
        const statElements = {
            'avg-tds': stats.avgTDS,
            'avg-ph': stats.avgPH, 
            'avg-temp': stats.avgTemp,
            'avg-hum': stats.avgHum
        };
        
        for (const [elementId, value] of Object.entries(statElements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        }
    }

    setupProfileEdit() {
        const profileForm = document.getElementById('profile-form');
        const ciudadInput = document.getElementById('edit-ciudad');
        const ubicacionInput = document.getElementById('edit-ubicacion');
        const topicInput = document.getElementById('edit-topic');

        if (this.userData) {
            ciudadInput.value = this.userData.ciudad || '';
            topicInput.value = this.userData.mqttTopic || 'QUIVALDITEZO';
        }
        
        this.loadStationLocation().then(location => {
            ubicacionInput.value = location || '';
        });
        
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateProfileData({
                ciudad: ciudadInput.value,
                ubicacion: ubicacionInput.value,
                topic: topicInput.value
            });
        });
    }

    async loadStationLocation() {
        if (!this.userStation) return '';
        
        try {
            const stationDoc = await getDoc(doc(db, "estaciones", this.userStation.toString()));
            if (stationDoc.exists()) {
                return stationDoc.data().ubicacion || '';
            }
        } catch (error) {
            console.error('Error cargando ubicación:', error);
        }
        return '';
    }

    async updateProfileData(updates) {
        try {
            const userDocRef = doc(db, "usuarios", this.currentUser.uid);
            await updateDoc(userDocRef, { 
                ciudad: updates.ciudad,
                mqttTopic: updates.topic
            });
            
            if (this.userStation) {
                const stationRef = doc(db, "estaciones", this.userStation.toString());
                await updateDoc(stationRef, { 
                    ubicacion: updates.ubicacion,
                    ultima_actualizacion: new Date()
                });
            }
            
            this.userData.ciudad = updates.ciudad;
            this.updateUI();
            
            this.showAlert('¡Información actualizada correctamente!', 'success');
            
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            this.showAlert('Error al actualizar: ' + error.message, 'danger');
        }
    }

    updateDashboard(data) {
        console.log("📊 Actualizando dashboard con datos:", data);
        
        const elements = {
            'tds-value': data.tds || data.TDS || '--',
            'ph-value': data.ph || data.PH || '--', 
            'temp-value': data.temp || data.Temperatura || '--',
            'hum-value': data.hum || data.Humedad || '--'
        };

        // Actualizar tarjetas de métricas
        for (const [elementId, value] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value !== '--' ? value : '--';
            }
        }
        
        // 🆕 ACTUALIZAR GAUGES - CONEXIÓN DIRECTA
        if (window.gaugeManager && window.gaugeManager.updateAllGauges) {
            console.log("🎯 Enviando datos a gauges:", {
                TDS: data.TDS || data.tds,
                PH: data.PH || data.ph,
                Temperatura: data.Temperatura || data.temp,
                Humedad: data.Humedad || data.hum
            });
            
            window.gaugeManager.updateAllGauges({
                TDS: data.TDS || data.tds || 0,
                PH: data.PH || data.ph || 0,
                Temperatura: data.Temperatura || data.temp || 0,
                Humedad: data.Humedad || data.hum || 0
            });
        } else {
            console.warn("⚠️ Gauge Manager no disponible");
        }
        
        // Actualizar timestamp
        if (data.timestamp || data.Fecha) {
            let date;
            if (data.timestamp) {
                date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            } else {
                date = new Date(`${data.Fecha}T${data.Hora}`);
            }
            
            document.getElementById('last-update').textContent = 
                `Última actualización: ${date.toLocaleString()}`;
        }
    }

    updateUI() {
        if (this.userData) {
            document.getElementById('userName').textContent = this.userData.nombre || 'Usuario';
            document.getElementById('dashboard-user-name').textContent = this.userData.nombre || 'Usuario';
            
            if (this.userData.ciudad) {
                document.getElementById('station-location').textContent = this.userData.ciudad;
            }
        }
        
        document.getElementById('userNavItem').classList.remove('d-none');
        document.getElementById('logoutNavItem').classList.remove('d-none');
        
        this.loadStatistics();
        
        if (window.chartManager) {
            setTimeout(() => {
                window.chartManager.initCharts();
            }, 1500);
        }
        
        if (window.gaugeManager) {
            setTimeout(() => {
                console.log("🚦 Gauges listos para usar");
            }, 2000);
        }
    }

    setupLogout() {
        document.getElementById('logoutNavLink').addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                this.showAlert('Error al cerrar sesión: ' + error.message, 'danger');
            }
        });
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const main = document.querySelector('main');
        main.insertBefore(alertDiv, main.firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});