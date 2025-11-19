import { auth } from './firebase-app.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export function protectPage(redirectTo = "login.html") {
  // Evitar redirección si ya estamos en login/register
  const currentPage = window.location.pathname;
  if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log('🔐 Usuario no autenticado, redirigiendo a login...');
      
      // Agregar parámetro para evitar bucles
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set('redirect', window.location.pathname);
      
      window.location.href = url.toString();
    }
  });
}