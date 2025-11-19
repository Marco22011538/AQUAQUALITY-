// js/firebase-app.js - CONFIGURACIÓN CORREGIDA Y COMPLETA
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig2 = {
  apiKey: "AIzaSyBDlRaG4FctisIuvbQI_pK34gxxH0usHSM",
  authDomain: "aquaquality.firebaseapp.com",
  projectId: "aquaquality",
  storageBucket: "aquaquality.firebasestorage.app",
  messagingSenderId: "1098965693425",
  appId: "1:1098965693425:web:cb1995f7b65591f40b8a50"
};

// ✅ INICIALIZAR Y EXPORTAR CORRECTAMENTE
const app = initializeApp(firebaseConfig2);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ EXPORTAR TODO LO NECESARIO
export { app, auth, db };