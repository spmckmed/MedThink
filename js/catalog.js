// Mock Videos Data
const mockVideos = [
    {
        id: '1',
        title: 'Traitement des AVC ischémiques aigus',
        description: 'Protocole de prise en charge des AVC ischémiques en phase aiguë',
        specialty: 'neurologie',
        duration: 12.5,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        author: 'Dr. Marie Lambert',
        authorAvatar: 'https://i.pravatar.cc/150?img=1',
        views: 1850,
        likes: 342,
        comments: 28,
        liked: false,
        reported: false,
        createdAt: new Date('2023-12-05')
    },
    {
        id: '2',
        title: 'Épilepsie : Nouveaux traitements 2024',
        description: 'Les dernières avancées dans le traitement de l\'épilepsie',
        specialty: 'neurologie',
        duration: 15.3,
        thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
        author: 'Dr. Thomas Richard',
        authorAvatar: 'https://i.pravatar.cc/150?img=2',
        views: 2100,
        likes: 425,
        comments: 45,
        liked: false,
        reported: true,
        createdAt: new Date('2023-12-10')
    },
    {
        id: '3',
        title: 'Sclérose en plaques : Diagnostic précoce',
        description: 'Comment diagnostiquer précocement la sclérose en plaques',
        specialty: 'neurologie',
        duration: 8.7,
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
        author: 'Dr. Sophie Martin',
        authorAvatar: 'https://i.pravatar.cc/150?img=3',
        views: 1560,
        likes: 289,
        comments: 32,
        liked: false,
        reported: false,
        createdAt: new Date('2023-12-15')
    },
    {
        id: '4',
        title: 'Vaccination nourrissons : Guide 2024',
        description: 'Mise à jour du calendrier vaccinal des nourrissons',
        specialty: 'pediatrie',
        duration: 10.2,
        thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
        author: 'Dr. Claire Bernard',
        authorAvatar: 'https://i.pravatar.cc/150?img=4',
        views: 1890,
        likes: 367,
        comments: 56,
        liked: false,
        reported: false,
        createdAt: new Date('2023-12-18')
    },
    {
        id: '5',
        title: 'Insuffisance cardiaque : Nouveaux traitements',
        description: 'Les dernières avancées dans le traitement de l\'insuffisance cardiaque',
        specialty: 'cardiologie',
        duration: 13.8,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        author: 'Dr. Jean Dupont',
        authorAvatar: 'https://i.pravatar.cc/150?img=5',
        views: 2300,
        likes: 456,
        comments: 67,
        liked: false,
        reported: false,
        createdAt: new Date('2023-12-20')
    }
];

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const specialtyFilter = document.getElementById('specialtyFilter');
const durationFilter = document.getElementById('durationFilter');
const sortFilter = document.getElementById('sortFilter');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Current filters state
let currentFilters = {
    specialty: '',
    duration: '',
    sort: 'recent',
    search: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    console.log('Video grid element:', videoGrid);
    setupEventListeners();
    loadVideos();
});

// Setup event listeners
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value.toLowerCase();
            loadVideos();
        }, 300));
    }

    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', () => {
            currentFilters.specialty = specialtyFilter.value;
            loadVideos();
        });
    }

    if (durationFilter) {
        durationFilter.addEventListener('change', () => {
            currentFilters.duration = durationFilter.value;
            loadVideos();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            currentFilters.sort = sortFilter.value;
            loadVideos();
        });
    }
}

// Load and filter videos
function loadVideos() {
    if (!videoGrid) {
        console.error('Video grid element not found');
        return;
    }

    let filteredVideos = [...mockVideos];

    // Apply filters
    if (currentFilters.specialty) {
        filteredVideos = filteredVideos.filter(video => 
            video.specialty === currentFilters.specialty
        );
    }

    if (currentFilters.duration) {
        const durationRanges = {
            'short': [0, 5],
            'medium': [5, 15],
            'long': [15, Infinity]
        };
        const range = durationRanges[currentFilters.duration];
        if (range) {
            filteredVideos = filteredVideos.filter(video => 
                video.duration >= range[0] && video.duration < range[1]
            );
        }
    }

    if (currentFilters.search) {
        filteredVideos = filteredVideos.filter(video => {
            const searchText = `${video.title} ${video.description} ${video.specialty} ${video.author}`.toLowerCase();
            return searchText.includes(currentFilters.search);
        });
    }

    // Apply sorting
    filteredVideos.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'recent':
                return b.createdAt - a.createdAt;
            case 'popular':
                return b.views - a.views;
            case 'rating':
                return b.likes - a.likes;
            default:
                return 0;
        }
    });

    // Render videos
    renderVideos(filteredVideos);
}

// Render videos to grid
function renderVideos(videos) {
    if (!videoGrid) return;
    
    videoGrid.innerHTML = '';
    
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h3 class="mt-4">Aucun résultat trouvé</h3>
                <p class="text-muted">Essayez de modifier vos filtres de recherche</p>
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        
        card.innerHTML = `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <span class="duration">${formatDuration(video.duration)}</span>
                    <div class="hover-play">
                        <i class="bi bi-play-circle-fill"></i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="specialty-badge">${video.specialty}</div>
                    <h3>${video.title}</h3>
                    <div class="author">
                        <img src="${video.authorAvatar}" alt="${video.author}" class="author-avatar">
                        <span class="author-name">${video.author}</span>
                    </div>
                    <div class="video-stats">
                        <span class="views" title="Vues">
                            <i class="bi bi-eye"></i>
                            ${formatNumber(video.views)}
                        </span>
                        <span class="likes" title="J'aime">
                            <i class="bi bi-heart${video.liked ? '-fill' : ''}" role="button"></i>
                            ${formatNumber(video.likes)}
                        </span>
                        <span class="comments" title="Commentaires">
                            <i class="bi bi-chat-text" role="button"></i>
                            ${formatNumber(video.comments)}
                        </span>
                        <span class="share" title="Partager">
                            <i class="bi bi-share" role="button"></i>
                        </span>
                        <span class="report" title="Signaler un problème">
                            <i class="bi bi-flag${video.reported ? '-fill' : ''}" role="button"></i>
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const videoCard = card.querySelector('.video-card');
        const likeBtn = card.querySelector('.likes i');
        const commentBtn = card.querySelector('.comments i');
        const shareBtn = card.querySelector('.share i');
        const reportBtn = card.querySelector('.report i');

        videoCard.addEventListener('click', (e) => {
            // Prevent click event if clicking on action buttons
            if (!e.target.closest('.video-stats')) {
                console.log('Video clicked:', video.id);
            }
        });

        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            likeBtn.classList.toggle('bi-heart');
            likeBtn.classList.toggle('bi-heart-fill');
            video.liked = !video.liked;
            console.log('Like clicked:', video.id);
        });

        commentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Comment clicked:', video.id);
        });

        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Share clicked:', video.id);
        });

        reportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            reportBtn.classList.toggle('bi-flag');
            reportBtn.classList.toggle('bi-flag-fill');
            video.reported = !video.reported;
            console.log('Report clicked:', video.id);
        });

        videoGrid.appendChild(card);
    });

    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDuration(minutes) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k';
    }
    return number.toString();
}
