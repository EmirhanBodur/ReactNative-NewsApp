// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Firebase Storage modülünden getStorage fonksiyonunu alın
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyATJARBaKAc_oIiSH6fRCemqorvUnzJbho",
  authDomain: "newssapp-a3526.firebaseapp.com",
  projectId: "newssapp-a3526",
  storageBucket: "newssapp-a3526.appspot.com",
  messagingSenderId: "108564972404",
  appId: "1:108564972404:web:c7584a1ab898afe4726221",
  measurementId: "G-8W08CSMEYM",
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Auth, Firestore ve Storage nesnelerini al
// Auth nesnesini al
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
