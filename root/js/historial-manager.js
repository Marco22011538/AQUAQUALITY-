// 🆕 HISTORIAL-MANAGER.JS CORREGIDO
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    query, 
    where,
    orderBy,
    limit,
    addDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app, db } from './firebase-app.js';

const auth = getAuth(app);

class HistorialManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.userStation = null;
        this.init();
    }

    async init() {
        console.log("📊 Inicializando Historial Manager...");
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                console.log("✅ Usuario autenticado para historial:", user.uid);
                await this.loadUserData();
                this.cargarHistorial();
            } else {
                console.log("❌ Usuario no autenticado para historial");
            }
        });
    }

    async loadUserData() {
        try {
            const userDocRef = doc(db, "usuarios", this.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                this.userData = userDoc.data();
                this.userStation = this.userData.id_station;
                console.log("✅ Datos de usuario cargados para historial:", this.userData);
            } else {
                console.log("❌ No se encontraron datos del usuario para historial");
            }
        } catch (error) {
            console.error("❌ Error cargando datos de usuario:", error);
        }
    }

    async cargarHistorial() {
        if (!this.userStation) {
            console.log("❌ No hay estación para cargar historial");
            return;
        }

        try {
            console.log("📋 Cargando historial para estación:", this.userStation);
            
            const registrosRef = collection(db, "registros");
            const q = query(
                registrosRef,
                where("ID_Station", "==", this.userStation),
                orderBy("timestamp", "desc"),
                limit(50)
            );
            
            const snapshot = await getDocs(q);
            const registros = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.mostrarHistorial(registros);
            console.log(`✅ Historial cargado: ${registros.length} registros`);
            
        } catch (error) {
            console.error("❌ Error cargando historial:", error);
            // Intentar método alternativo
            this.cargarHistorialFallback();
        }
    }

    async cargarHistorialFallback() {
        try {
            const registrosRef = collection(db, "registros");
            const snapshot = await getDocs(registrosRef);
            const allRegistros = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filtrar manualmente por estación
            const userRegistros = allRegistros.filter(reg => reg.ID_Station === this.userStation);
            this.mostrarHistorial(userRegistros);
            
            console.log(`✅ Historial (fallback): ${userRegistros.length} registros`);
            
        } catch (error) {
            console.error("❌ Error en método alternativo:", error);
        }
    }

    mostrarHistorial(registros) {
        const tbody = document.getElementById('historial-tbody');
        
        if (!tbody) {
            console.log("❌ No se encontró la tabla de historial");
            return;
        }

        if (registros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        <i class="bi bi-inbox me-2"></i>No hay registros disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = registros.map(registro => `
            <tr>
                <td>${registro.Fecha || '--'}</td>
                <td>${registro.Hora || '--'}</td>
                <td><span class="badge bg-primary">${registro.ID_Station}</span></td>
                <td>${registro.Latitud || '--'}</td>
                <td>${registro.Longitud || '--'}</td>
                <td>${registro.TDS || '--'}</td>
                <td>${registro.PH || '--'}</td>
                <td>${registro.Temperatura || '--'}</td>
                <td>${registro.Humedad || '--'}</td>
            </tr>
        `).join('');

        // Actualizar estadísticas
        this.actualizarEstadisticas(registros);
    }

    actualizarEstadisticas(registros) {
        if (registros.length > 0) {
            const totalRegistros = document.getElementById('total-registros');
            const promedioTDS = document.getElementById('promedio-tds');
            const promedioPH = document.getElementById('promedio-ph');
            const ultimaActualizacion = document.getElementById('ultima-actualizacion');

            if (totalRegistros) totalRegistros.textContent = registros.length;
            
            if (promedioTDS) {
                const avgTDS = (registros.reduce((sum, r) => sum + (r.TDS || 0), 0) / registros.length).toFixed(2);
                promedioTDS.textContent = avgTDS;
            }
            
            if (promedioPH) {
                const avgPH = (registros.reduce((sum, r) => sum + (r.PH || 0), 0) / registros.length).toFixed(2);
                promedioPH.textContent = avgPH;
            }
            
            if (ultimaActualizacion && registros[0].timestamp) {
                const fecha = registros[0].timestamp.toDate ? 
                    registros[0].timestamp.toDate() : new Date(registros[0].timestamp);
                ultimaActualizacion.textContent = fecha.toLocaleTimeString();
            }
        }
    }

    async importarDatosDesdeJSON(datosJSON) {
        if (!this.userStation) {
            console.log("❌ No hay estación para importar datos");
            return;
        }

        try {
            console.log("📥 Importando datos JSON...");
            let importados = 0;

            for (const dato of datosJSON) {
                const registro = {
                    ...dato,
                    ID_Station: this.userStation, // Asignar a la estación del usuario
                    timestamp: new Date(`${dato.Fecha}T${dato.Hora}`)
                };

                await addDoc(collection(db, "registros"), registro);
                importados++;
                console.log(`✅ Registro ${importados} importado`);
            }

            console.log(`🎉 Total importados: ${importados} registros`);
            this.cargarHistorial(); // Recargar el historial
            
        } catch (error) {
            console.error("❌ Error importando datos:", error);
        }
    }
}

// Inicializar cuando esté en el dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.historialManager = new HistorialManager();
    });
}