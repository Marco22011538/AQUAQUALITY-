// firebase-config.js - VERSIÓN CORREGIDA
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDSbSLPQXv142LSWuZk_WuI09UqRPMNM1Y",
  authDomain: "e-comerce-aquasense.firebaseapp.com",
  projectId: "e-comerce-aquasense",
  storageBucket: "e-comerce-aquasense.appspot.com",
  messagingSenderId: "1014383346461",
  appId: "1:1014383346461:web:867bce15318ccfedfc17f4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);