// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7MnRIlLQLoUr-mWbLNNFBbRsmMhRzai4",
  authDomain: "clark-online.firebaseapp.com",
  projectId: "clark-online",
  storageBucket: "clark-online.firebasestorage.app",
  messagingSenderId: "552869388337",
  appId: "1:552869388337:web:b37724d7f979c1a7407510",
  measurementId: "G-QQ9GM04TJB"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
