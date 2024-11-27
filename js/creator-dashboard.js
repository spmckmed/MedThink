// Initialisation du dashboard
function initDashboard() {
    // Données mockées pour le dashboard
    updateDashboardStats({
        videos: 5,
        views: 1250,
        likes: 89
    });
    
    // Charger la liste des vidéos
    loadVideos();
    
    // Initialiser les gestionnaires d'événements
    initEventListeners();
}

// Mise à jour des statistiques
function updateDashboardStats(stats) {
    document.getElementById('totalVideos').textContent = stats.videos;
    document.getElementById('totalViews').textContent = stats.views;
    document.getElementById('totalLikes').textContent = stats.likes;
}

// Chargement des vidéos (données mockées)
function loadVideos() {
    const mockVideos = [
        {
            title: "Introduction à la cardiologie",
            thumbnail: "img/thumbnails/cardio-intro.jpg",
            views: 324,
            likes: 28,
            date: "2023-12-15"
        },
        {
            title: "Techniques d'auscultation",
            thumbnail: "img/thumbnails/auscultation.jpg",
            views: 256,
            likes: 19,
            date: "2023-12-10"
        }
    ];

    const videosList = document.getElementById('videosList');
    if (!videosList) return;

    videosList.innerHTML = mockVideos.map(video => `
        <div class="col-md-4">
            <div class="video-card">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='img/default-thumbnail.jpg'">
                <div class="card-body">
                    <h5 class="card-title">${video.title}</h5>
                    <div class="video-stats">
                        <span><i class="bi bi-eye"></i> ${video.views}</span>
                        <span><i class="bi bi-heart"></i> ${video.likes}</span>
                        <span><i class="bi bi-calendar"></i> ${new Date(video.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Gestion de l'upload de vidéo
function initUploadZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const videoForm = document.getElementById('videoForm');

    if (!dropZone || !fileInput || !videoForm) return;

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    videoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Vidéo uploadée avec succès !');
        videoForm.reset();
        videoForm.style.display = 'none';
    });
}

function handleFileUpload(file) {
    if (file.type.startsWith('video/')) {
        document.getElementById('videoForm').style.display = 'block';
    } else {
        alert('Veuillez sélectionner un fichier vidéo valide.');
    }
}

// Gestion de la navigation
function initNavigation() {
    document.querySelectorAll('#sidebar a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            document.querySelectorAll('#sidebar li').forEach(li => {
                li.classList.remove('active');
            });
            
            // Ajouter la classe active au parent du lien cliqué
            this.parentElement.classList.add('active');
            
            // Masquer toutes les sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Afficher la section correspondante
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Gestion du profil
function initProfile() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    // Pré-remplir le formulaire avec des données mockées
    document.getElementById('firstName').value = 'John';
    document.getElementById('lastName').value = 'Doe';
    document.getElementById('specialty').value = 'Cardiologie';
    document.getElementById('bio').value = 'Cardiologue spécialisé en imagerie cardiaque';

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Profil mis à jour avec succès !');
    });
}

// Initialisation des gestionnaires d'événements
function initEventListeners() {
    // Toggle sidebar
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
            document.getElementById('content').classList.toggle('active');
        });
    }

    // Initialiser la navigation
    initNavigation();
    
    // Initialiser la zone d'upload
    initUploadZone();
    
    // Initialiser le profil
    initProfile();
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initDashboard);
