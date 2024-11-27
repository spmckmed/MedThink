import { auth, onAuthStateChanged } from './firebase-config.js';

// Gestion de l'état de l'authentification
const updateNavigation = (user) => {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const restrictedElements = document.querySelectorAll('.restricted-content');
    
    if (user) {
        // Utilisateur connecté
        authButtons?.classList.add('d-none');
        userMenu?.classList.remove('d-none');
        
        // Mise à jour du menu utilisateur
        const userEmail = document.querySelector('.user-email');
        if (userEmail) userEmail.textContent = user.email;
        
        // Débloquer le contenu restreint
        restrictedElements.forEach(element => {
            element.classList.remove('locked');
            element.querySelector('.lock-overlay')?.remove();
        });
    } else {
        // Utilisateur non connecté
        authButtons?.classList.remove('d-none');
        userMenu?.classList.add('d-none');
        
        // Bloquer le contenu restreint
        restrictedElements.forEach(element => {
            element.classList.add('locked');
            if (!element.querySelector('.lock-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'lock-overlay';
                overlay.innerHTML = `
                    <i class="bi bi-lock-fill"></i>
                    <p>Connectez-vous pour accéder à ce contenu</p>
                    <a href="/login.html" class="btn btn-primary btn-sm">Se connecter</a>
                `;
                element.appendChild(overlay);
            }
        });
    }
};

// Vérification de l'authentification
const checkAuth = (requiresAuth = false) => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            updateNavigation(user);
            if (requiresAuth && !user) {
                window.location.href = '/login.html';
            }
            resolve(user);
        });
    });
};

// Déconnexion
const handleLogout = async () => {
    try {
        await auth.signOut();
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
};

// Initialisation des écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.logout-button');
    logoutButton?.addEventListener('click', handleLogout);
    
    // Vérifier si la page nécessite une authentification
    const requiresAuth = document.body.hasAttribute('data-requires-auth');
    checkAuth(requiresAuth);
});

export { checkAuth, updateNavigation };
