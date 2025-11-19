// Datos de productos - Hardware de monitoreo de agua
const products = [
  { 
    id: 1, 
    name: "Kit Completo AquaMonitor Pro", 
    price: 4500, 
    img: "https://via.placeholder.com/300x300/0d6efd/ffffff?text=Kit+Completo+Pro",
    description: "Sistema completo de monitoreo con todos los sensores incluidos",
    category: "completo",
    features: ["Todos los sensores", "Carcasa IP67", "WiFi/Bluetooth", "App incluida"]
  },
  { 
    id: 2, 
    name: "Sensor de pH PH-4502C", 
    price: 1200, 
    img: "https://via.placeholder.com/300x300/198754/ffffff?text=Sensor+pH",
    description: "Sensor de pH líquido de alta precisión con electrodo E201C-BNC",
    category: "sensores",
    features: ["Rango 0-14 pH", "Precisión ±0.1", "Electrodo BNC"]
  },
  { 
    id: 3, 
    name: "Sensor TDS SEN0244", 
    price: 950, 
    img: "https://via.placeholder.com/300x300/ffc107/000000?text=Sensor+TDS",
    description: "Medidor de sólidos disueltos totales para calidad de agua",
    category: "sensores",
    features: ["Rango 0-1000 ppm", "Precisión ±10%", "Analógico"]
  },
  { 
    id: 4, 
    name: "Sensor DHT11", 
    price: 350, 
    img: "https://via.placeholder.com/300x300/6c757d/ffffff?text=Sensor+DHT11",
    description: "Sensor de temperatura y humedad ambiental",
    category: "sensores",
    features: ["Temperatura 0-50°C", "Humedad 20-90%", "Bajo consumo"]
  },
  { 
    id: 5, 
    name: "Estación Base WiFi", 
    price: 800, 
    img: "https://via.placeholder.com/300x300/0dcaf0/000000?text=Estación+Base",
    description: "Estación central para conexión de sensores y comunicación cloud",
    category: "accesorios",
    features: ["Conexión WiFi", "Alimentación 5V", "4 puertos sensores"]
  },
  { 
    id: 6, 
    name: "Kit Iniciación AquaMonitor", 
    price: 2800, 
    img: "https://via.placeholder.com/300x300/dc3545/ffffff?text=Kit+Iniciación",
    description: "Kit básico ideal para comenzar con el monitoreo de agua",
    category: "completo",
    features: ["Sensor pH + TDS", "Estación base", "App básica"]
  },
  { 
    id: 7, 
    name: "Carcasa Protectora IP67", 
    price: 450, 
    img: "https://via.placeholder.com/300x300/6f42c1/ffffff?text=Carcasa+IP67",
    description: "Carcasa resistente al agua para protección de sensores",
    category: "accesorios",
    features: ["IP67", "Material ABS", "Fácil instalación"]
  },
  { 
    id: 8, 
    name: "Pack Electrodos Repuesto", 
    price: 680, 
    img: "https://via.placeholder.com/300x300/fd7e14/ffffff?text=Electrodos",
    description: "Electrodos E201C-BNC de repuesto para sensor de pH",
    category: "accesorios",
    features: ["2 electrodos", "Compatibilidad total", "Larga duración"]
  }
];

// Planes de software
const softwarePlans = [
  {
    id: 1,
    name: "Plan Básico",
    price: 299,
    period: "mes",
    features: [
      "Monitoreo básico en tiempo real",
      "Alertas simples de calidad",
      "App móvil básica",
      "Soporte por email",
      "Sin historial de datos",
      "Sin gráficos avanzados",
      "Sin reportes automáticos"
    ]
  },
  {
    id: 2,
    name: "Plan Intermedio", 
    price: 599,
    period: "mes",
    features: [
      "Todo lo del Plan Básico",
      "Historial de datos (30 días)",
      "Gráficos básicos de tendencias", 
      "Alertas personalizadas",
      "App móvil completa",
      "Soporte prioritario",
      "Sin analytics avanzado"
    ]
  },
  {
    id: 3,
    name: "Plan Premium",
    price: 999, 
    period: "mes",
    features: [
      "Todo lo del Plan Intermedio",
      "Analytics avanzado",
      "Reportes automáticos PDF/Excel",
      "Historial ilimitado", 
      "API para integraciones",
      "Soporte 24/7 prioritario",
      "Múltiples usuarios"
    ]
  }
];

// Elementos del DOM
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const cartEmpty = document.getElementById("cart-empty");
const successToast = new bootstrap.Toast(document.getElementById('success-toast'));

// Carrito de compras
let cartData = JSON.parse(localStorage.getItem('cart')) || [];

// Variables del mapa
let map;
let routingControl;
let startMarker, endMarker;
let isMapSelectionMode = false;
let currentLocationMarker = null;
let selectedLocationMethod = 'current'; // 'current', 'map', 'manual'
let currentLocation = null;

// Diccionario de iconos para instrucciones en español
const instructionIcons = {
  'Head': 'fas fa-arrow-up',
  'Continue': 'fas fa-arrow-up',
  'Turn right': 'fas fa-arrow-right text-success',
  'Turn left': 'fas fa-arrow-left text-primary',
  'Sharp right': 'fas fa-redo text-success',
  'Sharp left': 'fas fa-undo text-primary',
  'Slight right': 'fas fa-arrow-alt-circle-right text-success',
  'Slight left': 'fas fa-arrow-alt-circle-left text-primary',
  'Keep right': 'fas fa-caret-right text-success',
  'Keep left': 'fas fa-caret-left text-primary',
  'Roundabout': 'fas fa-sync-alt text-warning',
  'Destination': 'fas fa-flag-checkered text-danger',
  'Start': 'fas fa-play-circle text-success',
  'Arrive': 'fas fa-check-circle text-success',
  'U-turn': 'fas fa-exchange-alt text-warning',
  'Fork': 'fas fa-code-branch text-info',
  'default': 'fas fa-directions text-secondary'
};

// Traducciones de instrucciones
const instructionTranslations = {
  'Head': 'Continúa',
  'Continue': 'Continúa',
  'Turn right': 'Gira a la derecha',
  'Turn left': 'Gira a la izquierda',
  'Sharp right': 'Giro cerrado a la derecha',
  'Sharp left': 'Giro cerrado a la izquierda',
  'Slight right': 'Ligero giro a la derecha',
  'Slight left': 'Ligero giro a la izquierda',
  'Keep right': 'Mantente a la derecha',
  'Keep left': 'Mantente a la izquierda',
  'Roundabout': 'Toma la rotonda',
  'Destination': 'Destino',
  'Start': 'Inicio',
  'Arrive': 'Llegada',
  'U-turn': 'Cambio de sentido',
  'Fork': 'Bifurcación',
  'onto': 'hacia',
  'and': 'y',
  'then': 'luego'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
  renderProducts();
  initializeMap();
  setupEventListeners();
  setupSearch();
  updateCart();
  setupPlanButtons();
  
  // Intentar obtener ubicación automáticamente al cargar
  setTimeout(() => {
    if (selectedLocationMethod === 'current') {
      useCurrentLocation();
    }
  }, 1000);
});

// ================== SISTEMA DE PRODUCTOS ==================

// Renderizar productos en tarjetas Bootstrap
function renderProducts(productsToRender = products) {
  productList.innerHTML = "";
  
  if (productsToRender.length === 0) {
    productList.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning">
          <i class="fas fa-search fa-2x mb-3"></i>
          <h4>No se encontraron productos</h4>
          <p class="mb-0">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      </div>
    `;
    return;
  }
  
  productsToRender.forEach(product => {
    const div = document.createElement("div");
    div.classList.add("col-md-6", "col-lg-4", "mb-4");
    
    // Determinar color del badge según categoría
    let badgeClass = "bg-primary";
    if (product.category === "sensores") badgeClass = "bg-success";
    if (product.category === "accesorios") badgeClass = "bg-warning text-dark";
    
    // Generar características como badges
    const featuresHTML = product.features ? product.features.map(feature => 
      `<span class="badge bg-light text-dark border me-1 mb-1 small">${feature}</span>`
    ).join('') : '';
    
    div.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${product.img}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title">${product.name}</h5>
            <span class="badge ${badgeClass}">${product.category}</span>
          </div>
          <p class="card-text flex-grow-1">${product.description}</p>
          ${featuresHTML ? `<div class="mb-3">${featuresHTML}</div>` : ''}
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="fw-bold text-primary fs-5">$${product.price}</span>
            <button class="btn btn-primary" onclick="addToCart(${product.id})">
              <i class="fas fa-cart-plus me-1"></i>Agregar
            </button>
          </div>
        </div>
      </div>
    `;
    productList.appendChild(div);
  });
}

// Configurar sistema de búsqueda y filtros
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchInputMobile = document.getElementById('search-input-mobile');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  function filterAndSortProducts() {
    const searchTerm = (searchInput?.value || searchInputMobile?.value || '').toLowerCase();
    const category = categoryFilter.value;
    const sortBy = sortFilter.value;
    
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                           product.description.toLowerCase().includes(searchTerm);
      const matchesCategory = category === 'all' || product.category === category;
      
      return matchesSearch && matchesCategory;
    });
    
    // Ordenar productos
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    renderProducts(filtered);
  }
  
  // Event listeners para todos los filtros
  if (searchInput) searchInput.addEventListener('input', filterAndSortProducts);
  if (searchInputMobile) searchInputMobile.addEventListener('input', filterAndSortProducts);
  categoryFilter.addEventListener('change', filterAndSortProducts);
  sortFilter.addEventListener('change', filterAndSortProducts);
}

// Funciones del carrito
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existingItem = cartData.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartData.push({...product, quantity: 1});
  }
  
  // Guardar en localStorage
  localStorage.setItem('cart', JSON.stringify(cartData));
  
  updateCart();
  successToast.show();
  
  // Animación del botón del carrito
  const cartBtn = document.getElementById('cart-btn');
  cartBtn.classList.remove('btn-light');
  cartBtn.classList.add('btn-warning');
  setTimeout(() => {
    cartBtn.classList.remove('btn-warning');
    cartBtn.classList.add('btn-light');
  }, 500);
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  if (cartData.length === 0) {
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
  } else {
    cartEmpty.style.display = "none";
    cartItems.style.display = "block";
    
    cartData.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      itemCount += item.quantity;
      
      const li = document.createElement("li");
      li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
      li.innerHTML = `
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="mb-0">${item.name}</h6>
            <span class="badge bg-primary rounded-pill">${item.quantity}</span>
          </div>
          <p class="mb-2 text-muted small">$${item.price} c/u</p>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary" onclick="decreaseQuantity(${index})" title="Disminuir">
              <i class="fas fa-minus"></i>
            </button>
            <button class="btn btn-outline-secondary" onclick="increaseQuantity(${index})" title="Aumentar">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="removeFromCart(${index})" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-end ms-3">
          <p class="mb-0 fw-bold fs-6">$${itemTotal}</p>
        </div>
      `;
      cartItems.appendChild(li);
    });
  }

  cartTotal.textContent = total;
  cartCount.textContent = itemCount;
}

function increaseQuantity(index) {
  cartData[index].quantity += 1;
  localStorage.setItem('cart', JSON.stringify(cartData));
  updateCart();
}

function decreaseQuantity(index) {
  if (cartData[index].quantity > 1) {
    cartData[index].quantity -= 1;
  } else {
    cartData.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cartData));
  updateCart();
}

function removeFromCart(index) {
  cartData.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cartData));
  updateCart();
}

// Configurar botones de planes de software
function setupPlanButtons() {
  // Agregar event listeners a los botones de planes
  document.querySelectorAll('.card .btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const planCard = this.closest('.card');
      const planName = planCard.querySelector('.card-title').textContent;
      const planPrice = planCard.querySelector('.h2').textContent;
      
      // Mostrar modal de confirmación o redirigir a formulario
      showPlanModal(planName, planPrice);
    });
  });
}

function showPlanModal(planName, planPrice) {
  // En una implementación real, aquí iría un modal de Bootstrap
  // Por ahora usamos un alert
  alert(`¡Excelente elección!\n\nHas seleccionado: ${planName}\nPrecio: ${planPrice}\n\nTe contactaremos para activar tu plan.`);
}

// Configurar event listeners
function setupEventListeners() {
  // Botón de finalizar compra
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cartData.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
      return;
    }
    
    const total = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Mostrar resumen de compra
    let orderSummary = "Resumen de tu pedido - AquaMonitor:\n\n";
    cartData.forEach(item => {
      orderSummary += `${item.name} - ${item.quantity} x $${item.price} = $${item.price * item.quantity}\n`;
    });
    orderSummary += `\nTotal: $${total}`;
    orderSummary += `\n\n¡Gracias por tu compra! Te contactaremos para coordinar la entrega.`;
    
    alert(orderSummary);
    
    // Limpiar carrito
    cartData = [];
    localStorage.removeItem('cart');
    updateCart();
    
    // Cerrar el offcanvas del carrito
    const offcanvasCart = bootstrap.Offcanvas.getInstance(document.getElementById('cart'));
    offcanvasCart.hide();
  });

  // Formulario de contacto
  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('¡Gracias por tu mensaje! Nuestro equipo de AquaMonitor te contactará pronto.');
    this.reset();
  });

  // Vincular botón carrito al offcanvas
  const cartBtn = document.getElementById("cart-btn");
  const offcanvasCart = new bootstrap.Offcanvas(document.getElementById("cart"));
  cartBtn.addEventListener("click", () => offcanvasCart.show());

  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ================== SISTEMA DE MAPAS MEJORADO ==================

function initializeMap() {
    // Inicializar mapa centrado en Ciudad de México
    map = L.map('map').setView([19.432608, -99.133209], 12);

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Icono personalizado para AquaMonitor
    const storeIcon = L.divIcon({
        html: '<i class="fas fa-tint fa-2x text-primary" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"></i>',
        iconSize: [30, 30],
        className: 'store-marker'
    });

    // Marcador de AquaMonitor (NO SE MUEVE)
    endMarker = L.marker([19.432608, -99.133209], { 
        icon: storeIcon,
        draggable: false 
    }).addTo(map)
    .bindPopup(`
        <div class="text-center">
            <h6 class="fw-bold text-primary mb-2">💧 AquaMonitor</h6>
            <p class="mb-1"><i class="fas fa-map-marker-alt text-danger"></i> Oficinas Centrales</p>
            <p class="mb-1"><i class="fas fa-clock text-warning"></i> Lun-Vie: 9:00 - 18:00</p>
            <p class="mb-0"><i class="fas fa-phone text-success"></i> (55) 1234-5678</p>
            <hr class="my-2">
            <small class="text-muted">¡Te esperamos!</small>
        </div>
    `)
    .openPopup();

    // Marcador de inicio (inicialmente oculto)
    startMarker = L.marker([0, 0], {
        draggable: true,
        icon: L.divIcon({
            html: '<i class="fas fa-play-circle fa-2x text-success" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"></i>',
            iconSize: [30, 30]
        })
    }).addTo(map)
    .bindPopup('Punto de partida<br><small>Arrastra para cambiar ubicación</small>')
    .on('dragend', function(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        updateSelectedLocation(position, 'map');
    });

    // Ocultar marcador inicialmente
    startMarker.setOpacity(0);

    // Event listener para clicks en el mapa
    map.on('click', function(e) {
        if (isMapSelectionMode) {
            handleMapClick(e.latlng);
        }
    });

    // Event listener para el input de búsqueda
    const startPointInput = document.getElementById('start-point');
    startPointInput.addEventListener('input', handleLocationInput);
    startPointInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateRoute();
        }
    });
}

// Configurar método de ubicación
function setLocationMethod(method) {
    selectedLocationMethod = method;
    
    // Actualizar botones
    document.getElementById('btn-current-location').classList.remove('active', 'location-active');
    document.getElementById('btn-map-location').classList.remove('active', 'location-active');
    document.getElementById('btn-manual-location').classList.remove('active', 'location-active');
    
    document.getElementById(`btn-${method}-location`).classList.add('active', 'location-active');
    
    // Mostrar/ocultar secciones
    const manualSection = document.getElementById('manual-input-section');
    if (method === 'manual') {
        manualSection.style.display = 'block';
        disableMapSelection();
    } else {
        manualSection.style.display = 'none';
    }
    
    // Ejecutar acción según método
    switch(method) {
        case 'current':
            useCurrentLocation();
            break;
        case 'map':
            enableMapSelection();
            break;
        case 'manual':
            // Solo mostrar input
            break;
    }
}

// FUNCIÓN MEJORADA PARA USAR LA UBICACIÓN ACTUAL
function useCurrentLocation() {
    if (!navigator.geolocation) {
        showLocationError('La geolocalización no es compatible con tu navegador');
        return;
    }

    showMapAlert('Obteniendo tu ubicación actual...', 'info');
    updateButtonState('current-location-btn', true, 'Buscando...');

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            currentLocation = coords;
            updateSelectedLocation(coords, 'current');
            showMapAlert('Ubicación actual detectada correctamente', 'success');
            updateButtonState('current-location-btn', false, 'Mi Ubicación');
        },
        function(error) {
            let errorMessage = 'No se pudo obtener tu ubicación';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación en la configuración de tu navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Información de ubicación no disponible. Intenta con otro método.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Tiempo de espera agotado. Verifica tu conexión a internet.';
                    break;
            }
            
            showLocationError(errorMessage);
            showMapAlert(errorMessage, 'warning');
            updateButtonState('current-location-btn', false, 'Mi Ubicación');
            
            // Cambiar a método manual si falla la geolocalización
            setLocationMethod('manual');
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }
    );
}

// FUNCIÓN MEJORADA PARA SELECCIONAR EN EL MAPA
function enableMapSelection() {
    isMapSelectionMode = true;
    const selectionAlert = document.getElementById('map-selection-mode');
    selectionAlert.classList.remove('d-none');
    
    updateButtonState('map-selection-btn', true, 'Seleccionando...');
    
    showMapAlert('Haz clic en cualquier lugar del mapa para seleccionar tu ubicación de partida', 'info');
    
    // Cambiar el cursor del mapa
    map.getContainer().style.cursor = 'crosshair';
    
    // Deshabilitar el modo de selección después de 30 segundos automáticamente
    setTimeout(() => {
        if (isMapSelectionMode) {
            disableMapSelection();
            showMapAlert('Modo de selección desactivado por inactividad', 'warning');
        }
    }, 30000);
}

function disableMapSelection() {
    isMapSelectionMode = false;
    const selectionAlert = document.getElementById('map-selection-mode');
    selectionAlert.classList.add('d-none');
    updateButtonState('map-selection-btn', false, 'Seleccionar');
    
    // Restaurar el cursor normal
    map.getContainer().style.cursor = '';
}

function handleMapClick(latlng) {
    if (!isMapSelectionMode) return;
    
    updateSelectedLocation(latlng, 'map');
    showMapAlert('Ubicación seleccionada en el mapa', 'success');
    disableMapSelection();
}

// ACTUALIZAR UBICACIÓN SELECCIONADA
function updateSelectedLocation(coords, method) {
    // Mostrar marcador de inicio
    startMarker.setLatLng(coords);
    startMarker.setOpacity(1);
    
    // Actualizar información en la interfaz
    const locationInfo = document.getElementById('selected-location-info');
    const locationText = document.getElementById('selected-location-text');
    
    if (method === 'current') {
        locationText.textContent = `Usando tu ubicación actual (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
        reverseGeocode(coords, function(address) {
            if (address) {
                locationText.textContent = `Ubicación actual: ${address}`;
            }
        });
    } else if (method === 'map') {
        locationText.textContent = `Ubicación seleccionada en el mapa (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
        reverseGeocode(coords, function(address) {
            if (address) {
                locationText.textContent = `Ubicación seleccionada: ${address}`;
            }
        });
    }
    
    locationInfo.classList.remove('d-none');
    
    // Actualizar campo de texto si es método manual
    if (method !== 'manual') {
        reverseGeocode(coords, function(address) {
            document.getElementById('start-point').value = address || `Ubicación (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
        });
    }
    
    // Mostrar información en el mapa
    const locationDisplay = document.getElementById('current-location-display');
    const locationDisplayText = document.getElementById('current-location-text');
    locationDisplayText.textContent = `Ubicación establecida (${method === 'current' ? 'Actual' : 'Seleccionada'})`;
    locationDisplay.classList.remove('d-none');
    
    // Centrar el mapa en la ubicación seleccionada
    map.setView(coords, 14);
}

// FUNCIÓN MEJORADA PARA CALCULAR RUTA
function calculateRoute() {
    // Validar que tengamos una ubicación de inicio
    if (!startMarker || startMarker.getOpacity() === 0) {
        showMapAlert('Primero selecciona una ubicación de partida', 'warning');
        return;
    }

    // Limpiar ruta anterior si existe
    if (routingControl) {
        map.removeControl(routingControl);
    }

    const startCoords = startMarker.getLatLng();
    const endCoords = endMarker.getLatLng();

    showMapAlert('Calculando la mejor ruta...', 'info');
    updateButtonState('calculate-route-btn', true, 'Calculando...');
    updateButtonState('main-calculate-btn', true, 'Calculando...');

    try {
        // Crear control de ruta
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startCoords.lat, startCoords.lng),
                L.latLng(endCoords.lat, endCoords.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    {
                        color: '#0d6efd',
                        opacity: 0.8,
                        weight: 6
                    }
                ]
            },
            createMarker: function() { return null; }, // No crear marcadores adicionales
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            formatter: new L.Routing.Formatter({
                language: 'es',
                units: 'metric'
            })
        }).addTo(map);

        // Eventos para obtener información de la ruta
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            // Actualizar información de la ruta
            displayRouteInfo(summary, routes[0].instructions);
            showMapAlert('Ruta calculada exitosamente', 'success');
            updateButtonState('calculate-route-btn', false, 'Calcular Ruta');
            updateButtonState('main-calculate-btn', false, 'Calcular Ruta');
        });

        routingControl.on('routingerror', function(e) {
            console.error('Error en el cálculo de ruta:', e.error);
            showMapAlert('Error al calcular la ruta. Intenta con otra ubicación.', 'danger');
            updateButtonState('calculate-route-btn', false, 'Calcular Ruta');
            updateButtonState('main-calculate-btn', false, 'Calcular Ruta');
        });

    } catch (error) {
        console.error('Error con el control de rutas:', error);
        showMapAlert('Error al inicializar el sistema de rutas.', 'danger');
        updateButtonState('calculate-route-btn', false, 'Calcular Ruta');
        updateButtonState('main-calculate-btn', false, 'Calcular Ruta');
    }
}

// MOSTRAR INFORMACIÓN DE LA RUTA
function displayRouteInfo(summary, instructions) {
    // Actualizar información básica
    document.getElementById('route-distance').textContent = (summary.totalDistance / 1000).toFixed(1) + ' km';
    document.getElementById('route-time').textContent = Math.round(summary.totalTime / 60) + ' min';
    
    // Mostrar instrucciones mejoradas
    displayEnhancedInstructions(instructions);
    
    // Mostrar sección de información
    document.getElementById('route-info').classList.remove('d-none');
    document.getElementById('no-route-info').classList.add('d-none');
    
    // Ajustar el mapa para mostrar toda la ruta
    if (routingControl) {
        const routes = routingControl.getRoutes();
        if (routes && routes[0]) {
            map.fitBounds(routes[0].bounds);
        }
    }
}

// FUNCIÓN MEJORADA PARA LIMPIAR RUTA
function clearRoute() {
    // Limpiar control de ruta
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    // Ocultar marcador de inicio
    if (startMarker) {
        startMarker.setOpacity(0);
    }
    
    // Limpiar información de la ruta
    document.getElementById('route-info').classList.add('d-none');
    document.getElementById('no-route-info').classList.remove('d-none');
    document.getElementById('route-instructions').innerHTML = '';
    document.getElementById('selected-location-info').classList.add('d-none');
    document.getElementById('current-location-display').classList.add('d-none');
    
    // Limpiar campo de texto
    document.getElementById('start-point').value = '';
    
    // Restablecer método a ubicación actual
    setLocationMethod('current');
    
    // Re-centrar el mapa en las oficinas
    map.setView([19.432608, -99.133209], 12);
    
    showMapAlert('Ruta y ubicación limpiadas', 'info');
}

// FUNCIONES AUXILIARES MEJORADAS
function updateButtonState(buttonId, loading, text) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${text}`;
    } else {
        button.disabled = false;
        button.innerHTML = text;
    }
}

function showMapAlert(message, type) {
    const toast = new bootstrap.Toast(document.getElementById('success-toast'));
    const toastBody = document.querySelector('#success-toast .toast-body');
    
    let icon = 'fa-info-circle';
    if (type === 'danger') icon = 'fa-exclamation-triangle';
    if (type === 'warning') icon = 'fa-exclamation-circle';
    if (type === 'success') icon = 'fa-check-circle';
    
    toastBody.innerHTML = `<i class="fas ${icon} me-2"></i>${message}`;
    document.getElementById('success-toast').classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    document.getElementById('success-toast').classList.add(`bg-${type}`);
    
    toast.show();
}

function showLocationError(message) {
    const locationInfo = document.getElementById('selected-location-info');
    const locationText = document.getElementById('selected-location-text');
    
    locationText.textContent = message;
    locationInfo.classList.remove('d-none', 'alert-info');
    locationInfo.classList.add('alert-warning');
}

function reverseGeocode(coords, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&accept-language=es`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                callback(data.display_name.split(',')[0] + ', ' + data.display_name.split(',')[1]);
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.error('Error en geocodificación inversa:', error);
            callback(null);
        });
}

function handleLocationInput(e) {
    const input = e.target.value.toLowerCase();
    
    if (input.length > 2) {
        console.log('Buscando ubicación:', input);
    }
}

function displayEnhancedInstructions(instructions) {
    const instructionsContainer = document.getElementById('route-instructions');
    instructionsContainer.innerHTML = '';
    
    instructions.forEach((instruction, index) => {
        const instructionText = instruction.text;
        const distance = (instruction.distance / 1000).toFixed(1) + ' km';
        
        // Encontrar el icono correspondiente
        let iconClass = instructionIcons.default;
        let displayText = instructionText;
        
        // Buscar coincidencias en las traducciones
        for (const [key, value] of Object.entries(instructionTranslations)) {
            if (instructionText.includes(key)) {
                displayText = instructionText.replace(key, value);
                if (instructionIcons[key]) {
                    iconClass = instructionIcons[key];
                }
                break;
            }
        }
        
        // Mejorar el texto para español
        displayText = improveSpanishInstructions(displayText);
        
        const div = document.createElement('div');
        div.className = 'route-step';
        div.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                    <i class="${iconClass} fa-lg mt-1"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <span class="fw-bold small">${displayText}</span>
                        <span class="badge bg-light text-dark ms-2">${distance}</span>
                    </div>
                    ${index === instructions.length - 1 ? 
                      '<small class="text-success"><i class="fas fa-flag-checkered me-1"></i>Destino alcanzado</small>' : 
                      '<small class="text-muted">Siguiente instrucción</small>'}
                </div>
            </div>
        `;
        instructionsContainer.appendChild(div);
    });
}

function improveSpanishInstructions(text) {
    // Mejoras adicionales para las instrucciones en español
    return text
        .replace(/Take the exit/, 'Toma la salida')
        .replace(/at roundabout/, 'en la rotonda')
        .replace(/exit the roundabout/, 'sal de la rotonda')
        .replace(/Go straight/, 'Continúa recto')
        .replace(/You have arrived/, 'Has llegado')
        .replace(/Your destination/, 'Tu destino')
        .replace(/on the left/, 'a la izquierda')
        .replace(/on the right/, 'a la derecha')
        .replace(/Drive to/, 'Conduce hacia')
        .replace(/Make a/, 'Realiza un')
        .replace(/Turn/, 'Gira');
}

function geocodeAddress(address, callback) {
    // Simulación de geocodificación - en producción usarías Nominatim o Google Maps
    const predefinedLocations = {
        'polanco, cdmx': { lat: 19.433, lng: -99.200 },
        'santa fe, cdmx': { lat: 19.357, lng: -99.267 },
        'roma, cdmx': { lat: 19.412, lng: -99.167 },
        'condesa, cdmx': { lat: 19.410, lng: -99.177 },
        'coyoacán, cdmx': { lat: 19.350, lng: -99.161 },
        'tlalpan, cdmx': { lat: 19.287, lng: -99.167 },
        'naucalpan, edo. méxico': { lat: 19.467, lng: -99.233 },
        'satélite, edo. méxico': { lat: 19.500, lng: -99.233 }
    };
    
    const normalizedAddress = address.toLowerCase().trim();
    
    // Buscar en ubicaciones predefinidas
    for (const [key, coords] of Object.entries(predefinedLocations)) {
        if (normalizedAddress.includes(key)) {
            callback(coords);
            return;
        }
    }
    
    // Si no se encuentra, usar geocodificación real con Nominatim
    const geocodingService = 'https://nominatim.openstreetmap.org/search';
    
    fetch(`${geocodingService}?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=es`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                callback({
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                });
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.error('Error en geocodificación:', error);
            callback(null);
        });
}