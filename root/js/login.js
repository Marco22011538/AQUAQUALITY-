// js/login.js - VERSIÓN CON RECUPERACIÓN DE CONTRASEÑA
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from './firebase-app.js';

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const recoveryForm = document.getElementById("recoveryForm");
const recoveryMessage = document.getElementById("recoveryMessage");
const recoveryModal = new bootstrap.Modal(document.getElementById('recoveryModal'));

// Login normal
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Mostrar estado de loading
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
  submitBtn.disabled = true;
  
  // Limpiar mensaje anterior
  message.textContent = '';
  message.className = '';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    
    // Éxito
    message.className = 'message-success';
    message.innerHTML = '<i class="fas fa-check-circle me-2"></i>Inicio de sesión exitoso. Redirigiendo...';
    
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    
  } catch (error) {
    // Error
    message.className = 'message-error';
    
    let errorText = "Error al iniciar sesión";
    switch (error.code) {
      case 'auth/invalid-email':
        errorText = "El formato del email es inválido";
        break;
      case 'auth/user-disabled':
        errorText = "Esta cuenta ha sido deshabilitada";
        break;
      case 'auth/user-not-found':
        errorText = "No existe una cuenta con este email";
        break;
      case 'auth/wrong-password':
        errorText = "La contraseña es incorrecta";
        break;
      case 'auth/too-many-requests':
        errorText = "Demasiados intentos fallidos. Intenta más tarde";
        break;
      case 'auth/network-request-failed':
        errorText = "Error de conexión. Verifica tu internet";
        break;
      default:
        errorText = "Error al iniciar sesión. Intenta nuevamente";
    }
    
    message.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${errorText}`;
    console.error("Error de login:", error);
    
  } finally {
    // Restaurar botón
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Recuperación de contraseña
recoveryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("recoveryEmail").value;
  const submitBtn = recoveryForm.querySelector('button[type="submit"]');

  // Mostrar estado de loading
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
  submitBtn.disabled = true;
  
  // Limpiar mensaje anterior
  recoveryMessage.textContent = '';
  recoveryMessage.className = '';

  try {
    await sendPasswordResetEmail(auth, email);
    
    // Éxito
    recoveryMessage.className = 'message-success';
    recoveryMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>¡Enlace enviado! Revisa tu correo electrónico.';
    
    // Limpiar formulario y cerrar modal después de 3 segundos
    setTimeout(() => {
      recoveryForm.reset();
      recoveryModal.hide();
    }, 3000);
    
  } catch (error) {
    // Error
    recoveryMessage.className = 'message-error';
    
    let errorText = "Error al enviar el enlace de recuperación";
    switch (error.code) {
      case 'auth/invalid-email':
        errorText = "El formato del email es inválido";
        break;
      case 'auth/user-not-found':
        errorText = "No existe una cuenta con este email";
        break;
      case 'auth/too-many-requests':
        errorText = "Demasiados intentos. Intenta más tarde";
        break;
      case 'auth/network-request-failed':
        errorText = "Error de conexión. Verifica tu internet";
        break;
      default:
        errorText = "Error al enviar el enlace. Intenta nuevamente";
    }
    
    recoveryMessage.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${errorText}`;
    console.error("Error en recuperación:", error);
    
  } finally {
    // Restaurar botón
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Limpiar mensajes cuando se cierra el modal
document.getElementById('recoveryModal').addEventListener('hidden.bs.modal', function () {
  recoveryMessage.textContent = '';
  recoveryMessage.className = '';
  recoveryForm.reset();
});