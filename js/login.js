import { 
    auth, 
    signInWithEmailAndPassword,
    signInWithPopup,
    googleProvider
} from './firebase-config.js';

// Fonction pour gérer la connexion avec Google
async function handleGoogleSignIn() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Redirection vers le tableau de bord
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Erreur de connexion Google:', error);
        showError(getErrorMessage(error.code));
    }
}

// Fonction pour gérer la connexion par email/mot de passe
async function handleEmailSignIn(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirection vers le tableau de bord
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showError(getErrorMessage(error.code));
    }
}

// Fonction pour afficher les erreurs
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Fonction pour obtenir le message d'erreur approprié
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/wrong-password':
            return 'Mot de passe incorrect.';
        case 'auth/user-not-found':
            return 'Aucun compte ne correspond à cet email.';
        case 'auth/invalid-email':
            return 'Adresse email invalide.';
        case 'auth/popup-closed-by-user':
            return 'La fenêtre de connexion a été fermée avant la fin du processus.';
        default:
            return 'Une erreur est survenue. Veuillez réessayer.';
    }
}

// Écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const googleButton = document.getElementById('googleSignIn');

    // Gestionnaire pour le formulaire de connexion par email
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await handleEmailSignIn(email, password);
    });

    // Gestionnaire pour le bouton Google
    googleButton.addEventListener('click', handleGoogleSignIn);
});
