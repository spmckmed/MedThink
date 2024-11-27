import { auth, db, storage } from './firebase-config.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// DOM Elements
const profileForm = document.getElementById('profileForm');
const securityForm = document.getElementById('securityForm');
const profilePicture = document.getElementById('profilePicture');
const editPhotoBtn = document.querySelector('.edit-photo-btn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Load user profile data
async function loadUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Set form values
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('specialty').value = userData.specialty || '';
            document.getElementById('licenseNumber').value = userData.licenseNumber || '';
            document.getElementById('hospital').value = userData.hospital || '';
            document.getElementById('bio').value = userData.bio || '';

            // Update profile header
            document.getElementById('profileName').textContent = `Dr. ${userData.firstName} ${userData.lastName}`;
            document.getElementById('profileSpecialty').textContent = userData.specialty;

            // Update stats
            document.getElementById('watchedCount').textContent = userData.watchedVideos?.length || 0;
            document.getElementById('trainingHours').textContent = `${Math.round(userData.totalWatchTime / 3600)}h`;
            document.getElementById('favoritesCount').textContent = userData.favorites?.length || 0;

            // Update subscription info
            if (userData.subscription) {
                document.getElementById('subscriptionPlan').textContent = userData.subscription.plan;
                document.getElementById('subscriptionStatus').textContent = userData.subscription.status;
            }

            // Load profile picture
            if (userData.profilePicture) {
                profilePicture.src = userData.profilePicture;
            } else {
                profilePicture.src = 'img/avatars/default-avatar.svg';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Une erreur est survenue lors du chargement du profil.');
    }
}

// Update profile information
async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const user = auth.currentUser;
        if (!user) return;

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            specialty: document.getElementById('specialty').value,
            hospital: document.getElementById('hospital').value,
            bio: document.getElementById('bio').value,
            updatedAt: new Date()
        };

        await updateDoc(doc(db, 'users', user.uid), formData);
        showSuccess('Profil mis à jour avec succès');
        loadUserProfile(); // Reload profile data
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Une erreur est survenue lors de la mise à jour du profil.');
    }
}

// Handle profile picture upload
async function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        // Create a reference to the profile picture in Firebase Storage
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update the user's profile with the new picture URL
        await updateDoc(doc(db, 'users', user.uid), {
            profilePicture: downloadURL
        });

        // Update the image on the page
        profilePicture.src = downloadURL;
        showSuccess('Photo de profil mise à jour avec succès');
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showError('Une erreur est survenue lors du téléchargement de la photo.');
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
        if (newPassword !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas.');
        }

        const user = auth.currentUser;
        if (!user) return;

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
        
        showSuccess('Mot de passe modifié avec succès');
        securityForm.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        showError(error.message === 'Les mots de passe ne correspondent pas.' 
            ? error.message 
            : 'Une erreur est survenue lors du changement de mot de passe.');
    }
}

// Utility functions for showing success/error messages
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('d-none');
    errorMessage.classList.add('d-none');
    setTimeout(() => successMessage.classList.add('d-none'), 3000);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    successMessage.classList.add('d-none');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadUserProfile);
profileForm.addEventListener('submit', updateProfile);
securityForm.addEventListener('submit', changePassword);

// Create a hidden file input for profile picture upload
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
fileInput.addEventListener('change', handleProfilePictureUpload);
document.body.appendChild(fileInput);

// Trigger file input when edit photo button is clicked
editPhotoBtn.addEventListener('click', () => fileInput.click());
