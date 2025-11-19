// auth-guard.js DESACTIVADO - Sin redirecciones automáticas
console.log('🛡️ Auth Guard - MODO PÚBLICO ACTIVADO');

export function protectPage() {
  console.log('✅ Modo público: Todas las páginas son accesibles sin login');
  // No hacer nada - acceso libre
}

export function redirectIfAuthenticated() {
  console.log('✅ Modo público: Sin redirecciones automáticas');
  // No hacer nada
}

export function requireAuth() {
  console.log('✅ Modo público: Sin requerimientos de autenticación');
  return Promise.resolve(true); // Siempre permite acceso
}