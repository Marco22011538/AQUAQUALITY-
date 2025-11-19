import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from './firebase-app.js';

export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}