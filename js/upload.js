// Import de la configuration
import config from './config.js';
import { SecurityUtils } from './utils/security.js';

// Configuration Bunny.net
const BUNNY_API_KEY = SecurityUtils.decodeApiKey(config.bunny.apiKey);
const BUNNY_LIBRARY_ID = config.bunny.libraryId;
const BUNNY_BASE_URL = config.bunny.baseUrl;
const BUNNY_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'AccessKey': BUNNY_API_KEY
};

// Variables globales
let currentUser = null;
let selectedFile = null;

// Éléments du DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadForm = document.getElementById('uploadForm');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = uploadProgress.querySelector('.progress-bar');
const statusMessage = document.getElementById('statusMessage');
const uploadButton = document.getElementById('uploadButton');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
    setupDropZone();
    setupFormValidation();
});

// Écouteur d'authentification
function setupAuthListener() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await verifyCreatorFolder();
        } else {
            window.location.href = '/login.html';
        }
    });
}

// Vérification/Création du dossier créateur
async function verifyCreatorFolder() {
    try {
        const creatorRef = firebase.firestore().collection('creators').doc(currentUser.uid);
        const creatorDoc = await creatorRef.get();

        if (!creatorDoc.exists || !creatorDoc.data().bunnyFolderId) {
            // Créer un nouveau dossier sur Bunny.net
            const folderName = `creator_${currentUser.uid}`;
            const folderId = await createBunnyFolder(folderName);

            // Sauvegarder l'ID du dossier dans Firebase
            await creatorRef.set({
                bunnyFolderId: folderId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        showError("Erreur lors de la vérification du dossier créateur", error);
    }
}

// Configuration de la zone de drop
function setupDropZone() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

// Gestion des événements de la zone de drop
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropZone.classList.add('drag-over');
}

function unhighlight(e) {
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    handleFile(file);
}

// Validation et traitement du fichier
function handleFile(file) {
    if (!file) return;

    // Vérification du type de fichier
    if (file.type !== 'video/mp4') {
        showError("Format de fichier non supporté", "Seuls les fichiers MP4 sont acceptés");
        return;
    }

    // Vérification de la taille (300MB = 314,572,800 bytes)
    if (file.size > 314572800) {
        showError("Fichier trop volumineux", "La taille maximum autorisée est de 300MB");
        return;
    }

    selectedFile = file;
    updateFilePreview();
}

// Mise à jour de l'aperçu du fichier
function updateFilePreview() {
    const prompt = dropZone.querySelector('.drop-zone-prompt');
    prompt.innerHTML = `
        <div class="file-preview">
            <i class="bi bi-file-earmark-play"></i>
            <div class="file-info">
                <div class="file-name">${selectedFile.name}</div>
                <div class="file-size">${formatFileSize(selectedFile.size)}</div>
            </div>
        </div>
    `;
}

// Validation du formulaire
function setupFormValidation() {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            showError("Aucun fichier sélectionné", "Veuillez sélectionner une vidéo à uploader");
            return;
        }

        if (!uploadForm.checkValidity()) {
            e.stopPropagation();
            uploadForm.classList.add('was-validated');
            return;
        }

        await handleUpload();
    });
}

// Récupération du dossier créateur
async function getCreatorFolder(userId) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData.bunnyFolderId) {
            throw new Error('Dossier créateur non trouvé');
        }
        
        return {
            id: userData.bunnyFolderId,
            name: userData.bunnyFolderName
        };
    } catch (error) {
        console.error('Erreur récupération dossier:', error);
        throw error;
    }
}

// Création de la vidéo sur Bunny.net
async function createBunnyVideo(title, folderId) {
    try {
        const response = await fetch(`${BUNNY_BASE_URL}/videos`, {
            method: 'POST',
            headers: BUNNY_HEADERS,
            body: JSON.stringify({
                title: title,
                collectionId: folderId // Utilisation du dossier du créateur
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erreur Bunny.net: ${error.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur création vidéo:', error);
        throw new Error('Impossible de créer la vidéo sur le serveur');
    }
}

// Upload vers Bunny.net avec progression
async function uploadToBunny(videoId) {
    try {
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const fileSize = selectedFile.size;
        let uploadedSize = 0;
        let start = 0;

        while (start < fileSize) {
            const end = Math.min(start + chunkSize, fileSize);
            const chunk = selectedFile.slice(start, end);
            const headers = {
                ...BUNNY_HEADERS,
                'Content-Range': `bytes ${start}-${end-1}/${fileSize}`
            };

            const response = await fetch(`${BUNNY_BASE_URL}/videos/${videoId}`, {
                method: 'PUT',
                headers: headers,
                body: chunk
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erreur upload: ${error.message}`);
            }

            start = end;
            uploadedSize += chunk.size;
            const progress = Math.round((uploadedSize / fileSize) * 100);
            updateProgress(progress);
        }

        // Vérifier le statut de l'encodage
        await checkEncodingStatus(videoId);

    } catch (error) {
        console.error('Erreur upload:', error);
        throw new Error('Erreur lors de l\'upload de la vidéo');
    }
}

// Vérification du statut d'encodage
async function checkEncodingStatus(videoId) {
    try {
        const maxAttempts = 30; // 5 minutes maximum (30 * 10 secondes)
        let attempts = 0;

        const checkStatus = async () => {
            const response = await fetch(`${BUNNY_BASE_URL}/videos/${videoId}`, {
                headers: BUNNY_HEADERS
            });

            if (!response.ok) throw new Error('Erreur de vérification du statut');

            const data = await response.json();
            console.log('Statut encodage:', data.status);

            switch (data.status) {
                case 'encoded':
                    return true;
                case 'failed':
                    throw new Error('L\'encodage de la vidéo a échoué');
                default:
                    if (attempts >= maxAttempts) {
                        throw new Error('Délai d\'encodage dépassé');
                    }
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes
                    return await checkStatus();
            }
        };

        await checkStatus();
        console.log('Encodage terminé avec succès');

    } catch (error) {
        console.error('Erreur encodage:', error);
        throw new Error('Problème lors de l\'encodage de la vidéo');
    }
}

// Gestion de l'upload
async function handleUpload() {
    try {
        disableForm(true);
        showProgress();
        updateProgress(0);

        // 1. Récupération du dossier créateur
        const user = firebase.auth().currentUser;
        const creatorFolder = await getCreatorFolder(user.uid);
        
        // 2. Créer la vidéo dans le dossier du créateur
        const videoData = await createBunnyVideo(
            document.getElementById('videoTitle').value,
            creatorFolder.id
        );
        console.log('Vidéo créée:', videoData);

        // 3. Upload le fichier
        await uploadToBunny(videoData.guid);
        console.log('Upload terminé');

        // 4. Sauvegarder les métadonnées
        await saveVideoMetadata({
            ...videoData,
            creatorFolder: creatorFolder.name,
            status: 'encoded',
            url: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoData.guid}`
        });

        showSuccess("Upload réussi!", "Votre vidéo a été uploadée et encodée avec succès");
        setTimeout(() => window.location.href = '/catalog.html', 2000);

    } catch (error) {
        console.error('Erreur globale:', error);
        showError("Erreur lors de l'upload", error.message);
        disableForm(false);
    }
}

// Sauvegarde des métadonnées dans Firebase
async function saveVideoMetadata(bunnyData) {
    const videoRef = firebase.firestore().collection('videos').doc();
    await videoRef.set({
        title: document.getElementById('videoTitle').value,
        description: document.getElementById('videoDescription').value,
        specialty: document.getElementById('videoSpecialty').value,
        bunnyId: bunnyData.guid,
        creatorId: currentUser.uid,
        creatorFolder: bunnyData.creatorFolder,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: bunnyData.status,
        views: 0,
        likes: 0,
        comments: 0,
        url: bunnyData.url
    });
}

// Fonctions utilitaires
function getCreatorFolderId() {
    return firebase.firestore()
        .collection('creators')
        .doc(currentUser.uid)
        .get()
        .then(doc => doc.data().bunnyFolderId);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showProgress() {
    uploadProgress.classList.remove('d-none');
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
}

function showError(title, message) {
    statusMessage.className = 'alert alert-danger';
    statusMessage.innerHTML = `<i class="bi bi-exclamation-triangle"></i> <strong>${title}:</strong> ${message}`;
    statusMessage.classList.remove('d-none');
}

function showSuccess(title, message) {
    statusMessage.className = 'alert alert-success';
    statusMessage.innerHTML = `<i class="bi bi-check-circle"></i> <strong>${title}:</strong> ${message}`;
    statusMessage.classList.remove('d-none');
}

function disableForm(disabled) {
    const elements = uploadForm.elements;
    for (let i = 0; i < elements.length; i++) {
        elements[i].disabled = disabled;
    }
    uploadButton.disabled = disabled;
}
