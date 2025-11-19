// ===== SISTEMA DEL CARRITO MEJORADO =====
console.log('🔧 Script del carrito cargado - VERSIÓN MEJORADA');

let cart = JSON.parse(localStorage.getItem('aquaquality_cart')) || [];
let cartCount = 0;
let cartTotal = 0;

// Base de datos de productos
const products = {
  1: { name: "Kit Completo AquaMonitor Pro", price: 4500, category: "completo" },
  2: { name: "Sensor de pH PH-4502C", price: 1200, category: "sensores" },
  3: { name: "Sensor TDS SEN0244", price: 950, category: "sensores" },
  4: { name: "Sensor DHT11", price: 350, category: "sensores" },
  5: { name: "Estación Base WiFi", price: 800, category: "accesorios" },
  6: { name: "Kit Iniciación AquaMonitor", price: 2800, category: "completo" },
  7: { name: "Carcasa Protectora IP67", price: 450, category: "accesorios" },
  8: { name: "Pack Electrodos Repuesto", price: 680, category: "accesorios" }
};

// ===== PAYPAL CONFIGURATION =====
let paypalButtonsInitialized = false;
let paypalButtonsInstance = null;

function initializePayPal() {
    if (paypalButtonsInitialized) {
        return;
    }
    
    // Limpiar contenedor de PayPal antes de inicializar
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
        paypalContainer.innerHTML = '';
    }
    
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no está cargado');
        setTimeout(initializePayPal, 1000);
        return;
    }
    
    try {
        paypalButtonsInstance = paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            },
            createOrder: function(data, actions) {
                if (!checkTermsAccepted()) {
                    showTermsModal('paypal');
                    return;
                }
                
                const { subtotal, tax, total } = calculateCartTotals();
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: 'MXN',
                            value: total.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: 'MXN',
                                    value: subtotal.toFixed(2)
                                },
                                tax_total: {
                                    currency_code: 'MXN',
                                    value: tax.toFixed(2)
                                }
                            }
                        },
                        items: cart.map(item => ({
                            name: item.name.substring(0, 127),
                            quantity: item.quantity.toString(),
                            unit_amount: {
                                currency_code: 'MXN',
                                value: item.price.toFixed(2)
                            },
                            category: 'PHYSICAL_GOODS'
                        }))
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    processOrder('paypal', details.id);
                    showToast('¡Pago completado exitosamente!', 'success');
                });
            },
            onError: function(err) {
                console.error('❌ Error en PayPal:', err);
                showToast('Error en el proceso de pago. Intenta nuevamente.', 'error');
            },
            onCancel: function(data) {
                showToast('Pago cancelado', 'warning');
            }
        });
        
        if (paypalContainer && paypalButtonsInstance) {
            paypalButtonsInstance.render('#paypal-button-container');
            paypalButtonsInitialized = true;
            console.log('✅ PayPal buttons inicializados');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando PayPal:', error);
    }
}

function clearPayPalButtons() {
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
        paypalContainer.innerHTML = '';
    }
    paypalButtonsInitialized = false;
    paypalButtonsInstance = null;
}

// ===== SISTEMA DE TÉRMINOS Y CONDICIONES =====

function checkTermsAccepted() {
    const acceptTerms = document.getElementById('acceptTerms');
    const acceptPrivacy = document.getElementById('acceptPrivacy');
    const acceptAge = document.getElementById('acceptAge');
    
    return acceptTerms && acceptTerms.checked && 
           acceptPrivacy && acceptPrivacy.checked && 
           acceptAge && acceptAge.checked;
}

function showTermsModal(paymentMethod) {
    const modalHTML = `
        <div class="modal fade" id="termsCheckModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>Aceptación Requerida
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Para completar tu compra</strong>, debes aceptar nuestros términos y condiciones.
                        </div>
                        
                        <div class="terms-checkbox-modal mb-3" onclick="document.getElementById('acceptTermsCheck').click()">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="acceptTermsCheck">
                                <label class="form-check-label fw-bold" for="acceptTermsCheck">
                                    <strong>Acepto los Términos y Condiciones de AQUAQUALITY</strong>
                                </label>
                            </div>
                        </div>
                        
                        <div class="terms-checkbox-modal mb-3" onclick="document.getElementById('acceptPrivacyCheck').click()">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="acceptPrivacyCheck">
                                <label class="form-check-label" for="acceptPrivacyCheck">
                                    Acepto la Política de Privacidad y el tratamiento de mis datos
                                </label>
                            </div>
                        </div>
                        
                        <div class="terms-checkbox-modal mb-3" onclick="document.getElementById('acceptAgeCheck').click()">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="acceptAgeCheck">
                                <label class="form-check-label" for="acceptAgeCheck">
                                    Confirmo que soy mayor de 18 años y tengo capacidad legal para realizar esta compra
                                </label>
                            </div>
                        </div>
                        
                        <div class="mt-3 p-3 bg-light rounded">
                            <small class="text-muted">
                                <strong>Importante:</strong> La aceptación de estos términos es obligatoria para proceder con el pago.
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmTerms">Aceptar y Continuar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('termsCheckModal'));
    modal.show();
    
    // Aplicar estilos a los checkboxes del modal
    const modalCheckboxes = document.querySelectorAll('#termsCheckModal .form-check-input');
    modalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parentDiv = this.closest('.terms-checkbox-modal');
            if (this.checked) {
                parentDiv.classList.add('checked');
            } else {
                parentDiv.classList.remove('checked');
            }
        });
    });
    
    document.getElementById('confirmTerms').addEventListener('click', function() {
        const termsChecked = document.getElementById('acceptTermsCheck').checked;
        const privacyChecked = document.getElementById('acceptPrivacyCheck').checked;
        const ageChecked = document.getElementById('acceptAgeCheck').checked;
        
        if (!termsChecked || !privacyChecked || !ageChecked) {
            showToast('Debes aceptar todos los términos para continuar', 'warning');
            return;
        }
        
        // Actualizar checkboxes del carrito
        const acceptTerms = document.getElementById('acceptTerms');
        const acceptPrivacy = document.getElementById('acceptPrivacy');
        const acceptAge = document.getElementById('acceptAge');
        
        if (acceptTerms) acceptTerms.checked = true;
        if (acceptPrivacy) acceptPrivacy.checked = true;
        if (acceptAge) acceptAge.checked = true;
        
        updateTermsCheckboxes();
        modal.hide();
        
        if (paymentMethod === 'paypal') {
            clearPayPalButtons();
            setTimeout(() => initializePayPal(), 500);
        } else if (paymentMethod === 'transferencia') {
            showTransferConfirmation();
        }
    });
    
    document.getElementById('termsCheckModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function updateTermsCheckboxes() {
    const checkboxes = document.querySelectorAll('.terms-checkbox .form-check-input');
    checkboxes.forEach(checkbox => {
        const parentDiv = checkbox.closest('.terms-checkbox');
        if (checkbox.checked) {
            parentDiv.classList.add('checked');
        } else {
            parentDiv.classList.remove('checked');
        }
    });
    checkTermsStatus();
}

function checkTermsStatus() {
    const termsAccepted = checkTermsAccepted();
    const paymentSection = document.querySelector('.payment-options');
    const checkoutBtn = document.getElementById('checkout-transferencia');
    
    if (termsAccepted) {
        paymentSection?.classList.remove('payment-disabled');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('btn-secondary');
            checkoutBtn.classList.add('btn-primary');
        }
        if (document.getElementById('paypal-button-container') && cart.length > 0) {
            clearPayPalButtons();
            setTimeout(() => initializePayPal(), 500);
        }
    } else {
        paymentSection?.classList.add('payment-disabled');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.remove('btn-primary');
            checkoutBtn.classList.add('btn-secondary');
        }
        clearPayPalButtons();
    }
}

function showFullTerms() {
    const termsModal = new bootstrap.Modal(document.getElementById('termsModal'));
    termsModal.show();
}

// ===== FUNCIONES DEL CARRITO =====

function addToCart(productId) {
  const product = products[productId];
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category
    });
  }
  
  localStorage.setItem('aquaquality_cart', JSON.stringify(cart));
  updateCart();
  showToast('✅ Producto agregado al carrito', 'success');
}

function updateCart() {
  cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }
  
  updateCartTotals();
  updateCartItems();
  toggleCartContent();
  checkTermsStatus();
}

function calculateCartTotals() {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  
  return { 
    subtotal: Math.round(subtotal * 100) / 100, 
    tax: Math.round(tax * 100) / 100, 
    total: Math.round(total * 100) / 100 
  };
}

function updateCartTotals() {
  const { subtotal, tax, total } = calculateCartTotals();
  
  const subtotalElement = document.getElementById('cart-subtotal');
  const taxElement = document.getElementById('cart-tax');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
  if (taxElement) taxElement.textContent = tax.toFixed(2);
  if (totalElement) totalElement.textContent = total.toFixed(2);
  
  cartTotal = total;
}

function toggleCartContent() {
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  
  if (!cartEmpty || !cartContent) return;
  
  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartContent.style.display = 'none';
    clearPayPalButtons();
  } else {
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';
    
    if (checkTermsAccepted()) {
      setTimeout(() => initializePayPal(), 500);
    }
  }
}

function updateCartItems() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => {
    const isPlan = item.id && item.id.toString().startsWith('plan-');
    const planBadge = isPlan ? '<span class="badge bg-info ms-2">Suscripción Mensual</span>' : '';
    const priceSuffix = isPlan ? '/mes' : '';
    
    return `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div class="flex-grow-1">
        <h6 class="mb-1">${item.name} ${planBadge}</h6>
        <small class="text-muted">$${item.price}${priceSuffix} x ${item.quantity}</small>
      </div>
      <div class="d-flex align-items-center">
        <span class="fw-bold me-3">$${(item.price * item.quantity).toFixed(2)}${priceSuffix}</span>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="updateQuantity(${isPlan ? `'${item.id}'` : item.id}, -1)">-</button>
          <span class="btn btn-light">${item.quantity}</span>
          <button class="btn btn-outline-primary" onclick="updateQuantity(${isPlan ? `'${item.id}'` : item.id}, 1)">+</button>
          <button class="btn btn-outline-danger" onclick="removeFromCart(${isPlan ? `'${item.id}'` : item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </li>
    `;
  }).join('');
}

function updateQuantity(productId, change) {
  const searchId = typeof productId === 'string' && productId.startsWith('plan-') ? productId : Number(productId);
  const item = cart.find(item => item.id === searchId);
  
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(searchId);
    } else {
      localStorage.setItem('aquaquality_cart', JSON.stringify(cart));
      updateCart();
    }
  }
}

function removeFromCart(productId) {
  const searchId = typeof productId === 'string' && productId.startsWith('plan-') ? productId : Number(productId);
  cart = cart.filter(item => item.id !== searchId);
  localStorage.setItem('aquaquality_cart', JSON.stringify(cart));
  updateCart();
  showToast('🗑️ Producto eliminado del carrito', 'warning');
}

// ===== SISTEMA DE PAGOS =====

function processOrder(paymentMethod, transactionId = null) {
  const { total } = calculateCartTotals();
  
  const orderData = {
    items: [...cart],
    total: total,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    timestamp: new Date().toISOString(),
    orderId: 'AQ-' + Date.now(),
    termsAccepted: checkTermsAccepted(),
    termsAcceptedDate: new Date().toISOString()
  };
  
  console.log('📦 Procesando pedido:', orderData);
  showOrderConfirmation(orderData);
  clearCart();
}

function clearCart() {
  cart = [];
  localStorage.removeItem('aquaquality_cart');
  updateCart();
  clearPayPalButtons();
}

function showOrderConfirmation(orderData) {
  const confirmationHTML = `
    <div class="modal fade" id="confirmationModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">¡Pedido Confirmado!</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
            <h4 class="text-success mb-3">Gracias por tu compra</h4>
            <div class="bg-light p-3 rounded mb-3">
              <p class="mb-1"><strong>Número de pedido:</strong> ${orderData.orderId}</p>
              <p class="mb-1"><strong>Total:</strong> $${orderData.total.toFixed(2)} MXN</p>
              <p class="mb-1"><strong>Método de pago:</strong> ${orderData.paymentMethod}</p>
              ${orderData.transactionId ? `<p class="mb-0"><strong>Transacción:</strong> ${orderData.transactionId}</p>` : ''}
            </div>
            <p class="text-muted">Te contactaremos pronto para coordinar la entrega.</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', confirmationHTML);
  const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  modal.show();
  
  document.getElementById('confirmationModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

// ===== FUNCIONES AUXILIARES =====

function showToast(message, type = 'success') {
  const toastElement = document.getElementById('success-toast');
  if (!toastElement) return;
  
  if (type === 'error') {
    toastElement.className = 'toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3';
  } else if (type === 'warning') {
    toastElement.className = 'toast align-items-center text-white bg-warning border-0 position-fixed bottom-0 end-0 m-3';
  } else {
    toastElement.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
  }
  
  const toastBody = toastElement.querySelector('.toast-body');
  const icon = type === 'error' ? 'fa-exclamation-circle' : 
               type === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle';
  
  toastBody.innerHTML = `<i class="fas ${icon} me-2"></i>${message}`;
  
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// ===== INICIALIZACIÓN =====

window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.selectPlan = selectPlan;
window.filterProducts = filterProducts;
window.processOrder = processOrder;
window.showFullTerms = showFullTerms;
window.checkTermsStatus = checkTermsStatus;
window.updateTermsCheckboxes = updateTermsCheckboxes;
window.clearPayPalButtons = clearPayPalButtons;

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM cargado, inicializando carrito...');
  initializeCart();
});

function initializeCart() {
  console.log('🔄 Inicializando sistema del carrito...');
  
  const checkoutBtn = document.getElementById('checkout-transferencia');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        showToast('El carrito está vacío', 'warning');
        return;
      }
      
      if (!checkTermsAccepted()) {
        showTermsModal('transferencia');
      } else {
        showTransferConfirmation();
      }
    });
  }
  
  const termsCheckboxes = document.querySelectorAll('.terms-checkbox input[type="checkbox"]');
  termsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateTermsCheckboxes();
    });
  });
  
  setupFilters();
  updateCart();
  
  console.log('✅ Carrito inicializado correctamente');
  console.log('📦 Productos en carrito:', cart);
}

// ===== TRANSFERENCIA BANCARIA =====

function showTransferConfirmation() {
  const { total } = calculateCartTotals();
  
  const modalHTML = `
    <div class="modal fade" id="transferModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Confirmar Pedido - Transferencia Bancaria</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Por favor realiza la transferencia por <strong>$${total.toFixed(2)} MXN</strong> a:</p>
            <div class="bg-light p-3 rounded mb-3">
              <p class="mb-1"><strong>Banco:</strong> BBVA</p>
              <p class="mb-1"><strong>Cuenta:</strong> 0123 4567 8901 2345</p>
              <p class="mb-1"><strong>CLABE:</strong> 012 320 1234 5678 9012 34</p>
              <p class="mb-0"><strong>Beneficiario:</strong> AQUAQUALITY S.A. de C.V.</p>
            </div>
            <p>Una vez realizado el pago, envíanos el comprobante a <strong>pagos@aquaquality.com</strong></p>
            
            <div class="alert alert-success mt-3">
              <i class="fas fa-check-circle me-2"></i>
              <strong>Términos aceptados:</strong> Has aceptado nuestros términos y condiciones.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirmTransfer">Confirmar Pedido</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = new bootstrap.Modal(document.getElementById('transferModal'));
  modal.show();
  
  document.getElementById('confirmTransfer').addEventListener('click', function() {
    processOrder('transferencia');
    modal.hide();
  });
  
  document.getElementById('transferModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

// ===== FILTROS Y BÚSQUEDA =====

function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  const searchInput = document.getElementById('search-input');
  const searchInputMobile = document.getElementById('search-input-mobile');
  
  if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
  if (sortFilter) sortFilter.addEventListener('change', filterProducts);
  if (searchInput) searchInput.addEventListener('input', filterProducts);
  if (searchInputMobile) searchInputMobile.addEventListener('input', filterProducts);
}

function filterProducts() {
  const category = document.getElementById('category-filter').value;
  const search = document.getElementById('search-input').value || 
                 document.getElementById('search-input-mobile').value;
  
  const productCards = document.querySelectorAll('#product-list .col-md-6');
  
  productCards.forEach(card => {
    const productName = card.querySelector('.card-title').textContent.toLowerCase();
    const productCategory = card.querySelector('.badge').textContent;
    
    const categoryMatch = category === 'all' || productCategory === category;
    const searchMatch = !search || productName.includes(search.toLowerCase());
    
    card.style.display = (categoryMatch && searchMatch) ? 'block' : 'none';
  });
}

// ===== PLANES DE SOFTWARE =====

function selectPlan(planName, price) {
  const planId = `plan-${planName.toLowerCase()}`;
  const planProduct = {
    id: planId,
    name: `Plan ${planName} - Software de Monitoreo`,
    price: price,
    quantity: 1,
    type: 'software',
    billing: 'mensual'
  };
  
  const existingPlan = cart.find(item => item.type === 'software');
  
  if (existingPlan) {
    const replace = confirm(`Ya tienes el "${existingPlan.name}" en tu carrito.\n¿Deseas reemplazarlo por el Plan ${planName}?`);
    if (replace) {
      cart = cart.filter(item => item.type !== 'software');
      cart.push(planProduct);
      showToast(`🔄 Plan cambiado a ${planName} - $${price}/mes`, 'success');
    } else {
      showToast('ℹ️ Manteniendo tu plan actual', 'info');
      return;
    }
  } else {
    cart.push(planProduct);
    showToast(`✅ Plan ${planName} agregado al carrito - $${price}/mes`, 'success');
  }
  
  localStorage.setItem('aquaquality_cart', JSON.stringify(cart));
  updateCart();
  
  setTimeout(() => {
    const cartElement = document.getElementById('cart');
    if (cartElement) {
      const cartOffcanvas = new bootstrap.Offcanvas(cartElement);
      cartOffcanvas.show();
    }
  }, 1000);
}

function getCart() {
  return cart;
}