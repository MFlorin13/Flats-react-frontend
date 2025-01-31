import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "react-project-7b8ac",
  storageBucket: "react-project-7b8ac.firebasestorage.app",
  messagingSenderId: "473034607844",
  appId: "1:473034607844:web:1198b3ed3bee9d3b5930f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);


// export {auth , googleProvider, db }
export { auth, googleProvider, db, storage };
