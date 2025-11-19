// gauge-manager.js - SISTEMA DE GAUGES CON MONITOREO EN TIEMPO REAL

class GaugeManager {
    constructor() {
        this.gauges = {};
        this.liveMonitoring = false;
        this.monitoringInterval = null;
        this.lastValues = {
            tds: 0,
            ph: 0,
            temperature: 0,
            humidity: 0
        };
        this.init();
    }

    init() {
        console.log("🚦 Inicializando Gauge Manager con Monitoreo en Tiempo Real...");
        
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            this.createAllGauges();
            this.setupLiveMonitoring();
            this.updateGaugesWithCurrentData();
            this.integrateWithDashboard();
        }, 1000);
    }

    createAllGauges() {
        this.createTDSGauge();
        this.createPHGauge();
        this.createTemperatureGauge();
        this.createHumidityGauge();
    }

    // 🆕 CONFIGURACIÓN DE MONITOREO EN TIEMPO REAL
    setupLiveMonitoring() {
        // Iniciar monitoreo automático
        this.startLiveMonitoring();
        
        // También monitorear cuando se creen registros de prueba
        this.monitorTestDataCreation();
    }

    // 🆕 INICIAR MONITOREO EN TIEMPO REAL
    startLiveMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            this.simulateLiveData();
        }, 3000); // Actualizar cada 3 segundos

        this.liveMonitoring = true;
        console.log("📊 Monitoreo en tiempo real ACTIVADO");
    }

    // 🆕 DETENER MONITOREO
    stopLiveMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.liveMonitoring = false;
        console.log("⏹️ Monitoreo en tiempo real DETENIDO");
    }

    // 🆕 SIMULAR DATOS EN TIEMPO REAL (efecto físico)
    simulateLiveData() {
        if (!this.liveMonitoring) return;

        // Solo simular si no hay datos reales recientes
        const hasRealData = this.checkForRealData();
        if (hasRealData) return;

        console.log("🎛️ Simulando datos de sensores físicos...");

        // Simular variaciones realistas de sensores
        const simulatedData = {
            TDS: this.generateRealisticValue('tds', this.lastValues.tds),
            PH: this.generateRealisticValue('ph', this.lastValues.ph),
            Temperatura: this.generateRealisticValue('temperature', this.lastValues.temperature),
            Humedad: this.generateRealisticValue('humidity', this.lastValues.humidity)
        };

        // Actualizar gauges con datos simulados
        this.updateAllGauges(simulatedData);

        // Actualizar también las tarjetas de métricas
        this.updateMetricCards(simulatedData);

        // Agregar efecto visual de "live"
        this.showLiveIndicator();
    }

    // 🆕 GENERAR VALORES REALISTAS PARA CADA SENSOR
    generateRealisticValue(type, lastValue) {
        const variations = {
            tds: { min: 50, max: 400, variation: 15 },
            ph: { min: 6.0, max: 8.0, variation: 0.3 },
            temperature: { min: 18, max: 32, variation: 2 },
            humidity: { min: 40, max: 85, variation: 8 }
        };

        const config = variations[type] || { min: 0, max: 100, variation: 5 };
        
        // Generar variación más realista (no siempre cambia)
        if (Math.random() > 0.7) { // 30% de probabilidad de cambio
            const variation = (Math.random() - 0.5) * 2 * config.variation;
            let newValue = lastValue + variation;
            
            // Mantener dentro de rangos realistas
            newValue = Math.max(config.min, Math.min(config.max, newValue));
            
            // Si es el primer valor, usar uno base realista
            if (lastValue === 0) {
                newValue = config.min + (Math.random() * (config.max - config.min) * 0.5);
            }
            
            this.lastValues[type] = newValue;
            return Number(newValue.toFixed(type === 'ph' ? 2 : 1));
        }
        
        return lastValue;
    }

    // 🆕 VERIFICAR SI HAY DATOS REALES
    checkForRealData() {
        // Verificar si hay datos recientes de Firebase
        const tdsValue = parseFloat(document.getElementById('tds-value')?.textContent);
        const phValue = parseFloat(document.getElementById('ph-value')?.textContent);
        
        return !isNaN(tdsValue) && tdsValue > 0 && !isNaN(phValue) && phValue > 0;
    }

    // 🆕 MONITOREAR CREACIÓN DE DATOS DE PRUEBA
    monitorTestDataCreation() {
        // Sobrescribir la función global para detectar cuando se crean datos de prueba
        const originalCreateTestData = window.crearRegistrosPrueba;
        
        window.crearRegistrosPrueba = () => {
            console.log("🎯 Datos de prueba detectados - Activando monitoreo real...");
            
            // Detener simulación temporalmente
            this.stopLiveMonitoring();
            
            // Ejecutar la función original
            if (originalCreateTestData) {
                originalCreateTestData();
            }
            
            // Reanudar monitoreo después de un tiempo
            setTimeout(() => {
                this.startLiveMonitoring();
            }, 5000);
        };
    }

    // 🆕 ACTUALIZAR TARJETAS DE MÉTRICAS
    updateMetricCards(data) {
        const elements = {
            'tds-value': data.TDS,
            'ph-value': data.PH,
            'temp-value': data.Temperatura,
            'hum-value': data.Humedad
        };

        for (const [elementId, value] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element && !this.hasRealData(element)) {
                element.textContent = value.toFixed(elementId === 'ph-value' ? 2 : 1);
                this.addDataUpdateEffect(element);
            }
        }
    }

    // 🆕 VERIFICAR SI UN ELEMENTO TIENE DATOS REALES
    hasRealData(element) {
        const value = element.textContent;
        return value !== '--' && value !== '0' && value !== '0.0';
    }

    // 🆕 AGREGAR EFECTO DE ACTUALIZACIÓN
    addDataUpdateEffect(element) {
        element.classList.add('data-update');
        setTimeout(() => {
            element.classList.remove('data-update');
        }, 1000);
    }

    // 🆕 MOSTRAR INDICADOR EN TIEMPO REAL
    showLiveIndicator() {
        let indicator = document.getElementById('live-monitoring-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'live-monitoring-indicator';
            indicator.innerHTML = `
                <div class="position-fixed top-0 end-0 m-3">
                    <div class="alert alert-success alert-dismissible fade show shadow" role="alert">
                        <i class="bi bi-cpu-fill me-2"></i>
                        <strong>Monitoreo en Tiempo Real</strong>
                        <span class="badge bg-danger ms-2 pulse">LIVE</span>
                        <button type="button" class="btn-close btn-sm" onclick="window.gaugeManager.stopLiveMonitoring()"></button>
                    </div>
                </div>
            `;
            document.body.appendChild(indicator);
        }

        // Efecto de parpadeo suave
        const liveBadge = indicator.querySelector('.badge');
        liveBadge.classList.toggle('bg-danger');
        
        setTimeout(() => {
            liveBadge.classList.toggle('bg-danger');
        }, 500);
    }

    // 🆕 GAUGE PARA TDS (CALIDAD DEL AGUA)
    createTDSGauge() {
        const ctx = document.getElementById('gaugeTDS');
        if (!ctx) {
            console.warn("❌ Canvas gaugeTDS no encontrado");
            return;
        }

        const color = getComputedStyle(document.documentElement).getPropertyValue('--tds-color').trim() || '#3498db';

        this.gauges.tds = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 500],
                    backgroundColor: [color, '#f8f9fa'],
                    borderWidth: 0,
                    borderRadius: 5,
                    borderColor: 'transparent'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return `TDS: ${context.parsed} ppm`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        console.log("✅ Gauge TDS creado - Listo para monitoreo");
    }

    // 🆕 GAUGE PARA PH
    createPHGauge() {
        const ctx = document.getElementById('gaugePH');
        if (!ctx) {
            console.warn("❌ Canvas gaugePH no encontrado");
            return;
        }

        const color = getComputedStyle(document.documentElement).getPropertyValue('--ph-color').trim() || '#9b59b6';

        this.gauges.ph = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 14],
                    backgroundColor: [color, '#f8f9fa'],
                    borderWidth: 0,
                    borderRadius: 5,
                    borderColor: 'transparent'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return `pH: ${context.parsed}`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        console.log("✅ Gauge PH creado - Listo para monitoreo");
    }

    // 🆕 GAUGE PARA TEMPERATURA
    createTemperatureGauge() {
        const ctx = document.getElementById('gaugeTemp');
        if (!ctx) {
            console.warn("❌ Canvas gaugeTemp no encontrado");
            return;
        }

        const color = getComputedStyle(document.documentElement).getPropertyValue('--temp-color').trim() || '#e74c3c';

        this.gauges.temperature = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 50],
                    backgroundColor: [color, '#f8f9fa'],
                    borderWidth: 0,
                    borderRadius: 5,
                    borderColor: 'transparent'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return `Temperatura: ${context.parsed} °C`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        console.log("✅ Gauge Temperatura creado - Listo para monitoreo");
    }

    // 🆕 GAUGE PARA HUMEDAD
    createHumidityGauge() {
        const ctx = document.getElementById('gaugeHum');
        if (!ctx) {
            console.warn("❌ Canvas gaugeHum no encontrado");
            return;
        }

        const color = getComputedStyle(document.documentElement).getPropertyValue('--hum-color').trim() || '#2ecc71';

        this.gauges.humidity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [color, '#f8f9fa'],
                    borderWidth: 0,
                    borderRadius: 5,
                    borderColor: 'transparent'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return `Humedad: ${context.parsed}%`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        console.log("✅ Gauge Humedad creado - Listo para monitoreo");
    }

    // 🆕 ACTUALIZAR GAUGE ESPECÍFICO - CORREGIDO
    updateGauge(gaugeName, value) {
        const gauge = this.gauges[gaugeName];
        if (!gauge) {
            console.warn(`❌ Gauge ${gaugeName} no encontrado`);
            return;
        }

        // Convertir a número y validar
        const numericValue = parseFloat(value) || 0;
        const config = this.getGaugeConfig(gaugeName);
        const normalizedValue = Math.min(Math.max(numericValue, 0), config.max);
        
        console.log(`🔄 Actualizando gauge ${gaugeName}: ${normalizedValue}`);
        
        // Guardar último valor
        this.lastValues[gaugeName] = normalizedValue;
        
        // Actualizar datos del gauge - CORRECCIÓN IMPORTANTE
        gauge.data.datasets[0].data = [normalizedValue, config.max - normalizedValue];
        
        // Actualizar texto del valor
        this.updateValueDisplay(gaugeName, normalizedValue, config.unit);
        
        // Actualizar animación
        gauge.update('active');
    }

    // 🆕 ACTUALIZAR DISPLAY DEL VALOR - MEJORADO
    updateValueDisplay(gaugeName, value, unit) {
        const displayId = `value${gaugeName.charAt(0).toUpperCase() + gaugeName.slice(1)}`;
        const displayElement = document.getElementById(displayId);
        
        if (displayElement) {
            // Formatear el valor según el tipo
            let displayValue;
            if (gaugeName === 'ph') {
                displayValue = parseFloat(value).toFixed(2);
            } else if (gaugeName === 'tds') {
                displayValue = parseFloat(value).toFixed(0);
            } else {
                displayValue = parseFloat(value).toFixed(1);
            }
            
            displayElement.textContent = displayValue + unit;
            
            // Actualizar color basado en el rango
            this.updateValueColor(displayElement, value, gaugeName);
            
            // Efecto de actualización
            this.addDataUpdateEffect(displayElement);
        }
    }

    // 🆕 ACTUALIZAR COLOR DEL VALOR
    updateValueColor(element, value, gaugeName) {
        const config = this.getGaugeConfig(gaugeName);
        let colorClass = '';
        
        for (const range of config.ranges) {
            if (value <= range.max) {
                colorClass = range.color === 'success' ? `${gaugeName}-color` :
                            range.color === 'warning' ? 'text-warning' : 'text-danger';
                break;
            }
        }
        
        element.className = `gauge-value fw-bold mt-2 ${colorClass}`;
    }

    // 🆕 CONFIGURACIÓN DE GAUGES
    getGaugeConfig(gaugeName) {
        const configs = {
            'tds': { 
                max: 500, 
                unit: ' ppm',
                ranges: [
                    { max: 150, color: 'success' },
                    { max: 300, color: 'warning' },
                    { max: 500, color: 'danger' }
                ]
            },
            'ph': { 
                max: 14, 
                unit: '',
                ranges: [
                    { max: 6.4, color: 'danger' },
                    { max: 7.5, color: 'success' },
                    { max: 14, color: 'danger' }
                ]
            },
            'temperature': { 
                max: 50, 
                unit: ' °C',
                ranges: [
                    { max: 10, color: 'danger' },
                    { max: 25, color: 'success' },
                    { max: 35, color: 'warning' },
                    { max: 50, color: 'danger' }
                ]
            },
            'humidity': { 
                max: 100, 
                unit: ' %',
                ranges: [
                    { max: 29, color: 'danger' },
                    { max: 70, color: 'success' },
                    { max: 85, color: 'warning' },
                    { max: 100, color: 'danger' }
                ]
            }
        };
        
        return configs[gaugeName] || { max: 100, unit: '', ranges: [] };
    }

    // 🆕 ACTUALIZAR TODOS LOS GAUGES - MEJORADO
    updateAllGauges(data) {
        console.log("🔄 Actualizando todos los gauges con datos:", data);
        
        // Asegurar que tenemos valores numéricos
        const tdsValue = parseFloat(data.TDS || data.tds || 0);
        const phValue = parseFloat(data.PH || data.ph || 0);
        const tempValue = parseFloat(data.Temperatura || data.temp || 0);
        const humValue = parseFloat(data.Humedad || data.hum || 0);
        
        this.updateGauge('tds', tdsValue);
        this.updateGauge('ph', phValue);
        this.updateGauge('temperature', tempValue);
        this.updateGauge('humidity', humValue);
        
        console.log("✅ Gauges actualizados:", {
            tds: tdsValue,
            ph: phValue,
            temperature: tempValue,
            humidity: humValue
        });
    }

    // 🆕 INTEGRACIÓN CON DASHBOARD
    integrateWithDashboard() {
        window.gaugeManager = this;
        
        if (window.dashboardManager) {
            console.log("🔗 Gauge Manager integrado con Dashboard Manager");
        }
        
        console.log("🎯 Gauge Manager listo para monitoreo en tiempo real");
    }

    // 🆕 ACTUALIZAR GAUGES CON DATOS ACTUALES - MEJORADO
    updateGaugesWithCurrentData() {
        setTimeout(() => {
            // Obtener valores actuales de las tarjetas
            const tdsElement = document.getElementById('tds-value');
            const phElement = document.getElementById('ph-value');
            const tempElement = document.getElementById('temp-value');
            const humElement = document.getElementById('hum-value');
            
            const tdsValue = tdsElement && tdsElement.textContent !== '--' ? 
                parseFloat(tdsElement.textContent) : this.lastValues.tds;
            const phValue = phElement && phElement.textContent !== '--' ? 
                parseFloat(phElement.textContent) : this.lastValues.ph;
            const tempValue = tempElement && tempElement.textContent !== '--' ? 
                parseFloat(tempElement.textContent) : this.lastValues.temperature;
            const humValue = humElement && humElement.textContent !== '--' ? 
                parseFloat(humElement.textContent) : this.lastValues.humidity;

            console.log("🔄 Sincronizando gauges con valores actuales:", {
                tds: tdsValue,
                ph: phValue,
                temperature: tempValue,
                humidity: humValue
            });

            this.updateGauge('tds', tdsValue);
            this.updateGauge('ph', phValue);
            this.updateGauge('temperature', tempValue);
            this.updateGauge('humidity', humValue);
        }, 1000);
    }
}

// Inicializar Gauge Manager
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html') || document.getElementById('gaugeTDS')) {
        setTimeout(() => {
            window.gaugeManager = new GaugeManager();
            console.log("✅ Gauge Manager con Monitoreo en Tiempo Real inicializado");
        }, 500);
    }
});

export default GaugeManager;