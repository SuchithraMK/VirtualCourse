import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "loginvirtualcourse-1aabd.firebaseapp.com",
  projectId: "loginvirtualcourse-1aabd",
  storageBucket: "loginvirtualcourse-1aabd.firebasestorage.app",
  messagingSenderId: "638849552810",
  appId: "1:638849552810:web:f14cdd9405d4515c929bd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}