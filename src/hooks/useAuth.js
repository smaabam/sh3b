import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, firebaseConfigured } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseConfigured) {
      return undefined;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError('');
      setUser(currentUser);

      if (!currentUser) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const adminRef = doc(db, 'admins', currentUser.uid);
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          await signOut(auth);
          setAdmin(null);
          setError('This account is not registered as an admin.');
          return;
        }

        setAdmin({
          uid: currentUser.uid,
          email: currentUser.email,
          ...adminSnap.data(),
        });
      } catch (authError) {
        setError(authError.message);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function login(email, password) {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (loginError) {
      setError(loginError.message);
      throw loginError;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, admin, loading, error, login, logout };
}
