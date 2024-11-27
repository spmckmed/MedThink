// Données simulées pour les vidéos
const latestVideos = [
    {
        id: 1,
        title: "Nouvelles approches en cardiologie",
        thumbnail: "img/video-thumb-1.jpg",
        creator: "Dr. Sophie Martin",
        duration: "5:30"
    },
    {
        id: 2,
        title: "Techniques de kinésithérapie innovantes",
        thumbnail: "img/video-thumb-2.jpg",
        creator: "Jean Dupont",
        duration: "4:45"
    },
    {
        id: 3,
        title: "Actualités en pharmacologie",
        thumbnail: "img/video-thumb-3.jpg",
        creator: "Dr. Pierre Dubois",
        duration: "6:15"
    }
];

// Fonction pour créer une carte vidéo
function createVideoCard(video) {
    return `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-duration">${video.duration}</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-creator">${video.creator}</p>
            </div>
        </div>
    `;
}

// Fonction pour charger les dernières vidéos
function loadLatestVideos() {
    const videoCarousel = document.querySelector('.video-carousel');
    if (videoCarousel) {
        videoCarousel.innerHTML = latestVideos.map(video => createVideoCard(video)).join('');
    }
}

// Animation des éléments au scroll
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.feature-card, .video-card');
    elements.forEach(element => {
        if (isElementInViewport(element) && !element.classList.contains('fade-in')) {
            element.classList.add('fade-in');
        }
    });
}

// Fonction utilitaire pour vérifier si un élément est visible
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Gestionnaire d'événements pour le défilement fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadLatestVideos();
    handleScrollAnimation();
    
    // Gestionnaire de scroll pour les animations
    window.addEventListener('scroll', handleScrollAnimation);
});

// Navigation responsive
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', () => {
        navbarCollapse.classList.toggle('show');
    });
}

// Fermeture automatique du menu mobile lors du clic sur un lien
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });
});
