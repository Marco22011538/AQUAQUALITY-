import { auth } from './firebase-app.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

export function setupAuthUI() {
  // NO hacer nada en páginas de login/register
  const currentPage = window.location.pathname;
  if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
    console.log('🔐 auth-ui.js: Página de login, desactivando UI updates');
    return;
  }

  console.log('👤 auth-ui.js: Configurando UI de autenticación');
  
  onAuthStateChanged(auth, (user) => {
    const loginNavItem = document.getElementById('loginNavItem');
    const registerNavItem = document.getElementById('registerNavItem');
    const userNavItem = document.getElementById('userNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    const userName = document.getElementById('userName');
    
    console.log('👤 Estado de autenticación:', user ? 'Logueado' : 'No logueado');
    
    if (user) {
      // Usuario logueado - mostrar info usuario y logout
      if (loginNavItem) loginNavItem.classList.add('d-none');
      if (registerNavItem) registerNavItem.classList.add('d-none');
      if (userNavItem) userNavItem.classList.remove('d-none');
      if (logoutNavItem) logoutNavItem.classList.remove('d-none');
      if (userName) userName.textContent = user.displayName || user.email;
    } else {
      // Usuario no logueado - mostrar login/register
      if (loginNavItem) loginNavItem.classList.remove('d-none');
      if (registerNavItem) registerNavItem.classList.remove('d-none');
      if (userNavItem) userNavItem.classList.add('d-none');
      if (logoutNavItem) logoutNavItem.classList.add('d-none');
    }
  });
}