// js/register.js - VERSIÓN COMPATIBLE CON SISTEMA DE MONITOREO
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth, db } from './firebase-app.js';

const form = document.getElementById("registerForm");
const message = document.getElementById("registerMessage");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordMatch = document.getElementById("passwordMatch");
const passwordStrength = document.getElementById("passwordStrength");
const topicInput = document.getElementById("topic");

// Validación de contraseña en tiempo real
passwordInput.addEventListener('input', function() {
  const password = this.value;
  const strength = checkPasswordStrength(password);
  updatePasswordStrength(strength);
});

// Confirmación de contraseña en tiempo real
confirmPasswordInput.addEventListener('input', function() {
  const password = passwordInput.value;
  const confirm = this.value;
  
  if (confirm === '') {
    passwordMatch.textContent = '';
    passwordMatch.className = 'form-text';
  } else if (password === confirm) {
    passwordMatch.textContent = '✅ Las contraseñas coinciden';
    passwordMatch.className = 'form-text text-success';
  } else {
    passwordMatch.textContent = '❌ Las contraseñas no coinciden';
    passwordMatch.className = 'form-text text-danger';
  }
});

function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[$@#&!]+/)) strength++;
  
  return strength;
}

function updatePasswordStrength(strength) {
  passwordStrength.className = 'password-strength';
  
  if (strength === 0) {
    passwordStrength.className += ' strength-weak';
  } else if (strength <= 2) {
    passwordStrength.className += ' strength-weak';
  } else if (strength === 3) {
    passwordStrength.className += ' strength-fair';
  } else if (strength === 4) {
    passwordStrength.className += ' strength-good';
  } else {
    passwordStrength.className += ' strength-strong';
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener todos los valores del formulario
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const company = document.getElementById("company").value.trim();
  const position = document.getElementById("position").value.trim();
  const clientType = document.getElementById("clientType").value;
  const companySize = document.getElementById("companySize").value;
  const sector = document.getElementById("sector").value;
  const country = document.getElementById("country").value;
  const city = document.getElementById("city").value.trim();
  const address = document.getElementById("address").value.trim();
  const newsletter = document.getElementById("newsletter").checked;
  const topic = document.getElementById("topic") ? document.getElementById("topic").value.trim() : null;

  const submitBtn = form.querySelector('button[type="submit"]');

  // Validaciones
  if (password !== confirmPassword) {
    message.className = 'message-error';
    message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Las contraseñas no coinciden';
    return;
  }

  if (password.length < 8) {
    message.className = 'message-error';
    message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>La contraseña debe tener al menos 8 caracteres';
    return;
  }

  // Mostrar estado de loading
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creando cuenta...';
  submitBtn.disabled = true;
  
  // Limpiar mensaje anterior
  message.textContent = '';
  message.className = '';

  try {
    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Asignar nombre visible
    await updateProfile(user, { displayName: name });

    // Guardar datos completos en Firestore
    const userData = {
      name: name,
      email: email,
      phone: phone,
      company: company || null,
      position: position || null,
      clientType: clientType,
      companySize: companySize || null,
      sector: sector || null,
      location: {
        country: country,
        city: city,
        address: address || null
      },
      preferences: {
        newsletter: newsletter
      },
        // 🆕 NUEVO CAMPO PARA MQTT
      mqttTopic: topic || null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active',
      
      // 🆕 CAMPOS PARA COMPATIBILIDAD CON MONITOREO
      nombre: name,
      ciudad: city,
      id_station: null,
      fecha_registro: new Date()
    };

    await setDoc(doc(db, "usuarios", user.uid), userData);

    // Éxito
    message.className = 'message-success';
    message.innerHTML = `<i class="fas fa-check-circle me-2"></i>¡Bienvenido ${name}! Tu cuenta ha sido creada exitosamente.`;
    
    console.log("Usuario creado y guardado en Firestore:", user.uid);
    console.log("Datos guardados:", userData);

    // Redirigir después de 3 segundos
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 3000);
    
  } catch (error) {
    console.error("Error al registrar:", error);

    // Manejo de errores específicos
    message.className = 'message-error';
    
    if (error.code === "auth/email-already-in-use") {
      message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Este correo ya está registrado. <a href="login.html" class="text-decoration-none">Inicia sesión</a> o recupera tu contraseña.';
    } else if (error.code === "auth/weak-password") {
      message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>La contraseña es demasiado débil. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.';
    } else if (error.code === "auth/invalid-email") {
      message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>El formato del correo electrónico es inválido.';
    } else if (error.code === "permission-denied" || error.message.includes("Missing or insufficient permissions")) {
      message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Error de permisos en la base de datos. Contacta al administrador.';
    } else if (error.code === "auth/network-request-failed") {
      message.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Error de conexión. Verifica tu internet e intenta nuevamente.';
    } else {
      message.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>Error al crear la cuenta: ${error.message}`;
    }
    
  } finally {
    // Restaurar botón
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Inicializar fuerza de contraseña
updatePasswordStrength(0);