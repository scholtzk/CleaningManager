import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const FirebaseTest = () => {
  const [status, setStatus] = useState<string>('Testing Firebase...');

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setStatus(`Firebase working! User: ${user.email}`);
        } else {
          setStatus('Firebase working! No user signed in');
        }
      });

      return () => unsubscribe();
    } catch (error) {
      setStatus(`Firebase error: ${error}`);
    }
  }, []);

  return (
    <div className="p-4 bg-blue-100 rounded">
      <h3>Firebase Test</h3>
      <p>{status}</p>
    </div>
  );
};

export default FirebaseTest;
