// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBwiDM5wDCw-VFzhwON7kt7k8cqPQiB6dw",
  authDomain: "little-luxury-shop.firebaseapp.com",
  databaseURL: "https://little-luxury-shop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "little-luxury-shop",
  storageBucket: "little-luxury-shop.firebasestorage.app",
  messagingSenderId: "1014410439266",
  appId: "1:1014410439266:web:ed251ceb90ea9045bfff3b",
  measurementId: "G-V0914Y159Y"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

// Export for use in other files
window.firebase = {
  getDatabase,
  getAuth,
  ref: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').ref,
  push: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').push,
  set: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').set,
  onValue: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').onValue,
  remove: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').remove,
  update: require('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js').update
};

window.firebaseApp = firebaseApp;