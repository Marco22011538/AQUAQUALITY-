import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  await addDoc(collection(db, "test"), {
    test: "ok",
    createdAt: new Date()
  });
  alert("✅ Firestore funciona correctamente");
} catch (error) {
  alert("❌ Error de Firestore: " + error.message);
}
