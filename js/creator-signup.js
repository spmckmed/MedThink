import { SecurityUtils } from './utils/security.js';
import config from './config.js';

// Configuration Firebase
const firebaseConfig = {
    // Votre configuration Firebase ici
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

// Gestion de l'authentification Google
const googleSignIn = document.getElementById('googleSignIn');
googleSignIn.addEventListener('click', async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        // Vérification du domaine email (optionnel)
        if (!user.email.endsWith('.med') && !user.email.endsWith('.edu')) {
            throw new Error('Veuillez utiliser une adresse email professionnelle');
        }

        // Redirection vers le formulaire de complétion du profil
        window.location.href = `complete-profile.html?uid=${user.uid}&email=${user.email}`;
    } catch (error) {
        console.error('Erreur Google Sign-in:', error);
        showError(error.message);
    }
});

// Gestion du formulaire d'inscription classique
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Récupération des données du formulaire
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const specialty = document.getElementById('specialty').value;

        // Validation du mot de passe
        if (!isPasswordValid(password)) {
            throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
        }

        // Création du compte Firebase
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Création du profil utilisateur
        await firebase.firestore().collection('users').doc(user.uid).set({
            firstName,
            lastName,
            email,
            specialty,
            role: 'creator',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false
        });

        // Création du dossier Bunny.net
        await createCreatorFolder(user, { firstName, lastName, specialty });

        // Envoi de l'email de vérification
        await user.sendEmailVerification({
            url: `${window.location.origin}/verify-email?email=${email}`,
            handleCodeInApp: true
        });

        // Redirection vers la page de confirmation
        window.location.href = '/email-verification.html';

    } catch (error) {
        console.error('Erreur inscription:', error);
        showError(error.message);
    }
});

// Création du dossier créateur sur Bunny.net
async function createCreatorFolder(user, profile) {
    try {
        const folderName = `${profile.lastName}_${profile.firstName}_${profile.specialty}`.toLowerCase();
        
        const response = await fetch(`${config.bunny.baseUrl}/collections`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'AccessKey': SecurityUtils.decodeApiKey(config.bunny.apiKey)
            },
            body: JSON.stringify({
                name: folderName,
                guid: user.uid
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création du dossier créateur');
        }

        const folderData = await response.json();
        
        // Sauvegarde de l'ID du dossier dans le profil
        await firebase.firestore().collection('users').doc(user.uid).update({
            bunnyFolderId: folderData.guid,
            bunnyFolderName: folderName
        });

        return folderData;
    } catch (error) {
        console.error('Erreur création dossier:', error);
        throw error;
    }
}

// Validation du mot de passe
function isPasswordValid(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

// Affichage des erreurs
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    signupForm.insertAdjacentElement('beforebegin', errorDiv);

    // Suppression après 5 secondes
    setTimeout(() => errorDiv.remove(), 5000);
}
