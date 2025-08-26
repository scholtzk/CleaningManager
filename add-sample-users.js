// Script to add sample users to Firebase for testing
// Run this with: node add-sample-users.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDAO0MRKXCq9DHO-EZkUcpEf3m18oH4bE8",
  authDomain: "property-manager-cf570.firebaseapp.com",
  projectId: "property-manager-cf570",
  storageBucket: "property-manager-cf570.firebasestorage.app",
  messagingSenderId: "392212452825",
  appId: "1:392212452825:web:1fa2672a6a3a86f8d735c8",
  measurementId: "G-12CN857J40",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleUsers = [
  {
    id: 'admin-user-1',
    email: 'admin@cleaningmanager.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+1234567890',
    isActive: true,
  },
  {
    id: 'cleaner-user-1',
    email: 'cleaner1@cleaningmanager.com',
    name: 'Sarah Johnson',
    role: 'cleaner',
    phone: '+1234567891',
    isActive: true,
  },
  {
    id: 'cleaner-user-2',
    email: 'cleaner2@cleaningmanager.com',
    name: 'Mike Chen',
    role: 'cleaner',
    phone: '+1234567892',
    isActive: true,
  },
  {
    id: 'cleaner-user-3',
    email: 'cleaner3@cleaningmanager.com',
    name: 'Emma Davis',
    role: 'cleaner',
    phone: '+1234567893',
    isActive: true,
  },
];

async function addSampleUsers() {
  console.log('Adding sample users to Firestore...');
  
  for (const user of sampleUsers) {
    try {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added user: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`❌ Failed to add user ${user.name}:`, error);
    }
  }
  
  console.log('\n📝 Sample users added!');
  console.log('\nYou can now create Firebase Auth accounts with these emails:');
  sampleUsers.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });
  console.log('\nOr use the signup form in the app to create new accounts.');
}

addSampleUsers().catch(console.error);
