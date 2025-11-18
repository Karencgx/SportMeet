// src/firebase.ts

// Importa las funciones necesarias desde el SDK de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth"; 

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyARrSDsfEy34_A96OfJYZukEkXEmpOhZCY",
  authDomain: "sportmeet-38e69.firebaseapp.com",
  projectId: "sportmeet-38e69",
  storageBucket: "sportmeet-38e69.firebasestorage.app",
  messagingSenderId: "259900928426",
  appId: "1:259900928426:web:59bfa0331da7ae610c3bd3",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa y exporta los servicios que necesitas
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
