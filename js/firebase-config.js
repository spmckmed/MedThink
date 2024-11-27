// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6dlFZBwALdkGIFtFrPPlqmxtsVpQgpls",
    authDomain: "medthink-576b9.firebaseapp.com",
    projectId: "medthink-576b9",
    storageBucket: "medthink-576b9.firebasestorage.app",
    messagingSenderId: "803988345213",
    appId: "1:803988345213:web:df3b930a47a850ae573c14",
    measurementId: "G-MLV6P51238"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { 
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Export services for use in other files
export { 
    app, 
    analytics, 
    auth, 
    db, 
    googleProvider,
    signInWithPopup,
    GoogleAuthProvider 
};
