import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCFQHvxYZM5o2tFYT8X8hTzauMEPUjfBLc",
    authDomain: "tiendaonline-a1359.firebaseapp.com",
    projectId: "tiendaonline-a1359",
    storageBucket: "tiendaonline-a1359.firebasestorage.app",
    messagingSenderId: "875122421966",
    appId: "1:875122421966:web:f8d36c58d7f972bd01a09f"
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);