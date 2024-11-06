import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-project-fa3ab.firebaseapp.com",
  projectId: "real-estate-project-fa3ab",
  storageBucket: "real-estate-project-fa3ab.appspot.com",
  messagingSenderId: "65360714318",
  appId: "1:65360714318:web:d4aa43721bcbf12ebcc11f",
};

export const app = initializeApp(firebaseConfig);
