import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'cleaner';
}

const AuthWrapper = ({ children, requiredRole }: AuthWrapperProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/signin');
      } else if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/cleaner');
        }
      }
    }
  }, [user, loading, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;
