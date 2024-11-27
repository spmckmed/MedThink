import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import config from './config.js';
import { SecurityUtils } from './utils/security.js';

// Fonction pour créer le dossier créateur sur Bunny.net
async function createCreatorFolder(user, userProfile) {
    try {
        const folderName = `${userProfile.lastName}_${userProfile.firstName}_${userProfile.specialty}`.toLowerCase();
        
        const response = await fetch(`${config.bunny.baseUrl}/collections`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'AccessKey': SecurityUtils.decodeApiKey(config.bunny.apiKey)
            },
            body: JSON.stringify({
                name: folderName,
                guid: user.uid // Utilisation de l'ID Firebase comme GUID unique
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création du dossier créateur');
        }

        const folderData = await response.json();
        
        // Sauvegarde de l'ID du dossier dans le profil Firebase
        await db.collection('users').doc(user.uid).update({
            bunnyFolderId: folderData.guid,
            bunnyFolderName: folderName
        });

        console.log('Dossier créateur créé avec succès:', folderName);
        return folderData;
    } catch (error) {
        console.error('Erreur création dossier:', error);
        throw error;
    }
}

// Création du compte beta testeur
async function createBetaTester() {
    try {
        console.log('Création du compte beta testeur...');
        
        // Créer le compte dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, 'creator1@medthink.fr', 'abcdef');
        const user = userCredential.user;
        
        console.log('Compte Firebase Auth créé:', user.uid);

        // Créer le profil dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: 'creator1@medthink.fr',
            firstName: 'Beta',
            lastName: 'Testeur',
            specialty: 'Cardiologie',
            role: 'creator',
            createdAt: new Date().toISOString(),
            isVerified: true
        });
        
        console.log('Profil Firestore créé');
        console.log('Compte beta testeur créé avec succès');
        
        // Se déconnecter après la création
        await auth.signOut();
        console.log('Déconnexion effectuée');
        
    } catch (error) {
        console.error('Erreur création compte beta:', error);
    }
}

// Créer le compte beta testeur
createBetaTester();

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Désactiver le bouton de soumission pour éviter les doubles soumissions
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    
    try {
        // Récupération des valeurs du formulaire
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const specialty = document.getElementById('specialty').value;
        const licenseNumber = document.getElementById('licenseNumber').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        if (password !== confirmPassword) {
            throw new Error("Les mots de passe ne correspondent pas");
        }

        if (!terms) {
            throw new Error("Vous devez accepter les conditions d'utilisation");
        }

        if (password.length < 8) {
            throw new Error("Le mot de passe doit contenir au moins 8 caractères");
        }

        // Création du compte Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ajout des informations dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            firstName,
            lastName,
            email,
            specialty,
            licenseNumber,
            role: 'doctor',
            verified: false,
            createdAt: new Date().toISOString(),
            subscription: {
                status: 'inactive',
                plan: null,
                startDate: null,
                endDate: null
            },
            profile: {
                gender: null,
                photoURL: null,
                bio: null,
                location: null,
                languages: []
            }
        });

        // Création du dossier créateur sur Bunny.net
        await createCreatorFolder(user, {
            firstName,
            lastName,
            specialty
        });

        // Redirection vers le tableau de bord
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error:', error);
        let errorMessage;
        
        if (error.code) {
            // Erreurs Firebase
            const errorMessages = {
                'auth/email-already-in-use': "Cette adresse email est déjà utilisée",
                'auth/invalid-email': "Adresse email invalide",
                'auth/operation-not-allowed': "L'inscription par email n'est pas activée",
                'auth/weak-password': "Le mot de passe est trop faible",
                'default': "Une erreur est survenue lors de l'inscription"
            };
            errorMessage = errorMessages[error.code] || errorMessages.default;
        } else {
            // Erreurs de validation
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        
        // Réactiver le bouton de soumission
        submitButton.disabled = false;
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    
    // Faire défiler jusqu'au message d'erreur
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
