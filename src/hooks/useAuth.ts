import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState, LoginCredentials, SignUpCredentials } from '@/types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setAuthState({
              user: userData,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: 'User data not found',
            });
          }
        } catch (error) {
          setAuthState({
            user: null,
            loading: false,
            error: 'Failed to fetch user data',
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      // User data will be fetched in the onAuthStateChanged listener
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : error.message;
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      // Create user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        email: credentials.email,
        name: credentials.name,
        role: credentials.role,
        phone: credentials.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : error.message;
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message 
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    signUp,
    logout,
    clearError,
  };
};
