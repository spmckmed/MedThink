import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Vérification de l'authentification
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadUserData(user.uid);
        await loadUserStats(user.uid);
        await loadRecentVideos(user.uid);
        await loadRecommendedVideos(user.uid);
    } else {
        // Redirection vers la page de connexion si non authentifié
        window.location.href = 'login.html';
    }
});

// Chargement des données utilisateur
async function loadUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = `Dr. ${userData.lastName}`;
            document.getElementById('welcomeName').textContent = `Dr. ${userData.lastName}`;
            
            // Avatar par défaut si non défini
            const avatarUrl = userData.avatarUrl || 'img/avatars/default.svg';
            document.getElementById('userAvatar').src = avatarUrl;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Chargement des statistiques utilisateur
async function loadUserStats(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Mise à jour des compteurs
            document.getElementById('watchedCount').textContent = userData.watchedVideos?.length || 0;
            document.getElementById('trainingHours').textContent = `${Math.round((userData.totalWatchTime || 0) / 3600)}h`;
            document.getElementById('favoritesCount').textContent = userData.favorites?.length || 0;
            document.getElementById('subscriptionStatus').textContent = 
                userData.subscription?.status === 'active' ? 'Actif' : 'Inactif';
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Chargement des vidéos récentes
async function loadRecentVideos(userId) {
    try {
        const historyQuery = query(
            collection(db, 'history'),
            where('userId', '==', userId),
            orderBy('watchedAt', 'desc'),
            limit(4)
        );
        
        const historySnapshot = await getDocs(historyQuery);
        const recentVideosContainer = document.getElementById('recentVideos');
        recentVideosContainer.innerHTML = '';
        
        for (const doc of historySnapshot.docs) {
            const historyData = doc.data();
            const videoDoc = await getDoc(doc(db, 'videos', historyData.videoId));
            
            if (videoDoc.exists()) {
                const videoData = videoDoc.data();
                recentVideosContainer.innerHTML += createVideoCard(videoData);
            }
        }
    } catch (error) {
        console.error('Error loading recent videos:', error);
    }
}

// Chargement des vidéos recommandées
async function loadRecommendedVideos(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        
        // Requête pour les vidéos de la même spécialité
        const recommendedQuery = query(
            collection(db, 'videos'),
            where('specialty', '==', userData.specialty),
            orderBy('rating', 'desc'),
            limit(4)
        );
        
        const recommendedSnapshot = await getDocs(recommendedQuery);
        const recommendedContainer = document.getElementById('recommendedVideos');
        recommendedContainer.innerHTML = '';
        
        recommendedSnapshot.forEach(doc => {
            const videoData = doc.data();
            recommendedContainer.innerHTML += createVideoCard(videoData);
        });
    } catch (error) {
        console.error('Error loading recommended videos:', error);
    }
}

// Création d'une carte vidéo
function createVideoCard(video) {
    return `
        <div class="col-md-3">
            <div class="card video-card">
                <div class="position-relative">
                    <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
                    <span class="video-duration">${formatDuration(video.duration)}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title h6">${video.title}</h5>
                    <p class="card-text small text-muted">
                        Dr. ${video.author.name} • ${video.views} vues
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Formatage de la durée
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Gestion de la déconnexion
document.getElementById('logoutButton').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});
