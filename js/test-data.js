import { auth, db } from './firebase-config.js';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function createTestUser() {
    try {
        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, 'user1@medthink.test', 'abcdef');
        const user = userCredential.user;

        // Créer le profil utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'user1@medthink.test',
            specialty: 'Cardiologie',
            licenseNumber: '12345678',
            role: 'doctor',
            verified: true,
            createdAt: new Date(),
            subscription: {
                status: 'actif',
                plan: 'Premium'
            },
            watchedVideos: ['video1', 'video2', 'video3'],
            totalWatchTime: 7200, // 2 heures
            favorites: ['video1', 'video4'],
            profilePicture: 'img/avatars/default-avatar.svg'
        });

        console.log('Compte test créé avec succès');
        return user;
    } catch (error) {
        console.error('Erreur lors de la création du compte test:', error);
        throw error;
    }
}

// Exécuter la création du compte test
createTestUser();
