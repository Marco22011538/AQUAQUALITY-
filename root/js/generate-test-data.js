import { 
    collection, 
    addDoc,
    doc,
    getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app, db } from './firebase-app.js';

const auth = getAuth(app);

class TestDataGenerator {
    constructor() {
        this.currentUser = null;
        this.userStation = null;
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserStation();
                this.setupTestDataUI();
            }
        });
    }

    async loadUserStation() {
        try {
            const userDoc = await getDoc(doc(db, "usuarios", this.currentUser.uid));
            if (userDoc.exists()) {
                this.userStation = userDoc.data().id_station;
                console.log("✅ Estación cargada para datos de prueba:", this.userStation);
            }
        } catch (error) {
            console.error("Error cargando estación:", error);
        }
    }

    setupTestDataUI() {
        const testButton = document.getElementById('generate-test-data');
        if (testButton) {
            testButton.addEventListener('click', () => this.generateTestData());
        }
    }

    async generateTestData() {
        if (!this.userStation) {
            this.showAlert('Primero necesitas tener una estación asignada.', 'warning');
            return;
        }

        if (!confirm('¿Generar 24 horas de datos de prueba? Esto agregará datos ficticios a tu estación.')) {
            return;
        }

        try {
            const datosRef = collection(db, "estaciones", this.userStation.toString(), "datos");
            const now = new Date();
            
            let generatedCount = 0;
            
            // Generar datos para las últimas 24 horas (1 dato por hora)
            for (let i = 24; i >= 0; i--) {
                const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
                const data = this.generateRandomWaterData();
                
                await addDoc(datosRef, {
                    ...data,
                    timestamp: timestamp
                });
                
                generatedCount++;
                console.log(`✅ Dato ${generatedCount} generado para: ${timestamp.toLocaleString()}`);
            }
            
            this.showAlert(`¡Datos de prueba generados exitosamente! Se crearon ${generatedCount} registros de las últimas 24 horas.`, 'success');
            
        } catch (error) {
            console.error('Error generando datos de prueba:', error);
            this.showAlert('Error al generar datos: ' + error.message, 'danger');
        }
    }

    generateRandomWaterData() {
        // Generar datos realistas de monitoreo de agua
        return {
            TDS: Math.floor(Math.random() * 500) + 50, // 50-550 ppm (rango normal)
            PH: (Math.random() * 3 + 6.5).toFixed(2), // 6.5-9.5 (rango aceptable)
            Temperatura: (Math.random() * 15 + 15).toFixed(1), // 15-30°C (rango ambiental)
            Humedad: Math.floor(Math.random() * 30 + 40) // 40-70% (rango normal)
        };
    }

    showAlert(message, type) {
        // Crear alerta de Bootstrap
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '1060';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar solo si estamos en el dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new TestDataGenerator();
    });
}