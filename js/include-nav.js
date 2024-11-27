// Fonction pour inclure la navigation
async function includeNavigation() {
    try {
        const response = await fetch('/includes/nav.html');
        const html = await response.text();
        
        // Insérer la navigation au début du body
        document.body.insertAdjacentHTML('afterbegin', html);
        
        // Marquer le lien actif
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelector(`.nav-link[href="${currentPage}"]`)?.classList.add('active');
        
    } catch (error) {
        console.error('Erreur lors du chargement de la navigation:', error);
    }
}

// Charger la navigation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', includeNavigation);
