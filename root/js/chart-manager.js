// chart-manager.js - VERSIÓN SIN EFECTO AZUL EN HOVER
import { 
    collection, 
    query, 
    where,
    orderBy,
    getDocs,
    limit
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { app, db } from './firebase-app.js';

class ChartManager {
    constructor() {
        this.charts = {};
        this.userStation = null;
        this.init();
    }

    async init() {
        console.log("📈 Inicializando Chart Manager - FILTRADO POR ESTACIÓN DEL USUARIO...");
        
        setTimeout(async () => {
            await this.getUserStation();
            this.initCharts();
        }, 2000);
    }

    async getUserStation() {
        if (window.dashboardManager && window.dashboardManager.userStation) {
            this.userStation = window.dashboardManager.userStation;
            console.log("🎯 Estación del usuario obtenida:", this.userStation);
        } else {
            console.log("⏳ Esperando estación del usuario...");
            setTimeout(() => this.getUserStation(), 1000);
        }
    }

    async loadUserRegistros() {
        if (!this.userStation) {
            console.log("❌ No hay estación de usuario para cargar registros");
            return [];
        }

        try {
            const registrosRef = collection(db, "registros");
            const q = query(
                registrosRef, 
                where("ID_Station", "==", this.userStation),
                orderBy("timestamp", "desc"), 
                limit(100)
            );
            
            const snapshot = await getDocs(q);
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📊 Registros de la estación ${this.userStation}: ${userData.length} registros`);
            return userData.reverse();
            
        } catch (error) {
            console.error("❌ Error cargando registros del usuario:", error);
            return this.loadUserRegistrosFallback();
        }
    }

    async loadUserRegistrosFallback() {
        try {
            const registrosRef = collection(db, "registros");
            const snapshot = await getDocs(registrosRef);
            const allData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const userData = allData.filter(reg => reg.ID_Station === this.userStation);
            console.log(`📊 Registros (fallback) estación ${this.userStation}: ${userData.length} registros`);
            
            return userData.reverse();
            
        } catch (error) {
            console.error("❌ Error en método alternativo:", error);
            return [];
        }
    }

    async initCharts() {
        if (!this.userStation) {
            console.log("⏳ Esperando estación del usuario para inicializar gráficos...");
            setTimeout(() => this.initCharts(), 1000);
            return;
        }

        try {
            const userData = await this.loadUserRegistros();
            
            if (userData.length > 0) {
                console.log(`🎯 Creando gráficos para estación ${this.userStation} con ${userData.length} registros`);
                this.createAllCharts(userData);
                this.hidePlaceholder();
            } else {
                this.showNoDataMessage();
            }
            
        } catch (error) {
            console.error("❌ Error inicializando gráficos:", error);
            this.showNoDataMessage();
        }
    }

    createAllCharts(data) {
        if (data.length === 0) {
            this.showNoDataMessage();
            return;
        }

        this.createTDSTrendChart(data);
        this.createPHTrendChart(data);
        this.createTemperatureChart(data);
        this.createHumidityChart(data);
        this.createComparativeChart(data);
        
        this.hidePlaceholder();
    }

    // 🆕 MODIFICADO: SIN FONDO AZUL EN HOVER
    createTDSTrendChart(data) {
        const ctx = document.getElementById('tds-trend-chart');
        if (!ctx) return;

        const labels = this.generateLabels(data);
        const tdsData = data.map(item => item.TDS || 0);

        this.charts.tdsTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Estación ${this.userStation} - TDS`,
                    data: tdsData,
                    borderColor: '#0d6efd', // Color de la línea
                    backgroundColor: 'transparent', // 🆕 CAMBIO: transparente en lugar de azul con opacidad
                    borderWidth: 3,
                    fill: false, // 🆕 CAMBIO: false para no rellenar el área bajo la línea
                    tension: 0.4,
                    pointBackgroundColor: '#0d6efd',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverBackgroundColor: '#0d6efd', // Color al hacer hover en puntos
                    pointHoverBorderColor: '#ffffff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Tendencia de TDS - Estación ${this.userStation}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'TDS (ppm)'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    // 🆕 MODIFICADO: SIN FONDO AZUL EN HOVER
    createPHTrendChart(data) {
        const ctx = document.getElementById('ph-trend-chart');
        if (!ctx) return;

        const labels = this.generateLabels(data);
        const phData = data.map(item => item.PH || 0);

        this.charts.pHTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Estación ${this.userStation} - PH`,
                    data: phData,
                    borderColor: '#9b59b6',
                    backgroundColor: 'transparent', // 🆕 CAMBIO: transparente
                    borderWidth: 3,
                    fill: false, // 🆕 CAMBIO: false para no rellenar
                    tension: 0.4,
                    pointBackgroundColor: '#9b59b6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverBackgroundColor: '#9b59b6',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Tendencia de PH - Estación ${this.userStation}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 6.0,
                        max: 8.5,
                        title: {
                            display: true,
                            text: 'PH'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    createTemperatureChart(data) {
        const ctx = document.getElementById('temperature-chart');
        if (!ctx) return;

        const dailyData = this.groupByDay(data);
        
        this.charts.temperature = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: `Estación ${this.userStation} - Temperatura`,
                    data: dailyData.temperatures,
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: '#e74c3c',
                    borderWidth: 2,
                    borderRadius: 5,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(231, 76, 60, 0.9)', // 🆕 Color al hacer hover
                    hoverBorderColor: '#e74c3c',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Temperatura Promedio por Día - Estación ${this.userStation}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '°C'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    createHumidityChart(data) {
        const ctx = document.getElementById('humidity-chart');
        if (!ctx) return;

        const dailyData = this.groupByDay(data);
        
        this.charts.humidity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: `Estación ${this.userStation} - Humedad`,
                    data: dailyData.humidities,
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    borderRadius: 5,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(46, 204, 113, 0.9)', // 🆕 Color al hacer hover
                    hoverBorderColor: '#2ecc71',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Humedad Promedio por Día - Estación ${this.userStation}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '%'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    // 🆕 MODIFICADO: SIN FONDO AZUL EN HOVER
    createComparativeChart(data) {
        const ctx = document.getElementById('comparative-chart');
        if (!ctx) return;

        const labels = this.generateLabels(data);
        const tdsData = data.map(item => item.TDS || 0);
        const phData = data.map(item => item.PH || 0);

        this.charts.comparative = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Estación ${this.userStation} - TDS`,
                        data: tdsData,
                        borderColor: '#0d6efd',
                        backgroundColor: 'transparent', // 🆕 CAMBIO: transparente
                        yAxisID: 'y',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false, // 🆕 CAMBIO: false para no rellenar
                        pointBackgroundColor: '#0d6efd',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverBackgroundColor: '#0d6efd',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverRadius: 6
                    },
                    {
                        label: `Estación ${this.userStation} - PH`,
                        data: phData,
                        borderColor: '#9b59b6',
                        backgroundColor: 'transparent', // 🆕 CAMBIO: transparente
                        yAxisID: 'y1',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false, // 🆕 CAMBIO: false para no rellenar
                        pointBackgroundColor: '#9b59b6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverBackgroundColor: '#9b59b6',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Comparativa TDS vs PH - Estación ${this.userStation}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { 
                            display: true, 
                            text: 'TDS (ppm)'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { 
                            display: true, 
                            text: 'PH' 
                        },
                        grid: { 
                            drawOnChartArea: false 
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    groupByDay(data) {
        const grouped = {};
        
        data.forEach(item => {
            const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
            const dateKey = date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit'
            });
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    temperatures: [],
                    humidities: []
                };
            }
            
            grouped[dateKey].temperatures.push(item.Temperatura || 0);
            grouped[dateKey].humidities.push(item.Humedad || 0);
        });

        const labels = Object.keys(grouped);
        const temperatures = labels.map(date => {
            const temps = grouped[date].temperatures;
            return temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
        });
        const humidities = labels.map(date => {
            const hums = grouped[date].humidities;
            return hums.length > 0 ? hums.reduce((a, b) => a + b, 0) / hums.length : 0;
        });

        return { labels, temperatures, humidities };
    }

    generateLabels(data) {
        return data.map(item => {
            const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
            return date.toLocaleDateString('es-MX', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        });
    }

    hidePlaceholder() {
        const placeholder = document.querySelector('.chart-placeholder');
        if (placeholder) {
            placeholder.classList.add('d-none');
        }
    }

    showNoDataMessage() {
        const placeholder = document.querySelector('.chart-placeholder');
        if (placeholder) {
            placeholder.classList.remove('d-none');
            placeholder.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-bar-chart fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No hay datos para gráficos</h5>
                    <p class="text-muted">Crea registros de prueba para ver las tendencias de tu estación ${this.userStation || ''}</p>
                    <button class="btn btn-outline-navy btn-sm" onclick="crearRegistrosPrueba()">
                        <i class="bi bi-database-add me-2"></i>Crear Registros de Prueba
                    </button>
                </div>
            `;
        }
    }

    async refreshCharts() {
        if (!this.userStation) {
            console.log("❌ No hay estación de usuario para actualizar gráficos");
            return;
        }

        const newData = await this.loadUserRegistros();
        if (newData.length > 0) {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            
            this.charts = {};
            this.createAllCharts(newData);
            console.log("🔄 Gráficos actualizados con nuevos datos");
        } else {
            console.log("ℹ️ No hay nuevos datos para actualizar gráficos");
        }
    }
}

// Inicializar
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.chartManager = new ChartManager();
        
        window.actualizarGraficos = function() {
            if (window.chartManager && window.chartManager.refreshCharts) {
                window.chartManager.refreshCharts();
            }
        };
    });
}