import config from './config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { loginWithEmail } from './config.js';

// Initialisation de Firebase
try {
    const app = initializeApp(config.firebaseConfig);
    window.auth = getAuth(app);
    window.db = getFirestore(app);
    alert('Firebase initialisé avec succès');
} catch (error) {
    alert('Erreur initialisation Firebase: ' + error.message);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const result = await loginWithEmail(email, password);
            
            if (result.success) {
                // Stocker les informations de l'utilisateur
                sessionStorage.setItem('user', JSON.stringify(result.user));
                // Rediriger vers le dashboard
                window.location.href = 'creator-dashboard.html';
            } else {
                errorMessage.textContent = result.error;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'Une erreur est survenue lors de la connexion.';
            errorMessage.style.display = 'block';
        }
    });
});
