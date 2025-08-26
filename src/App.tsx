import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SignIn from "./pages/SignIn";
import AdminDashboard from "./pages/AdminDashboard";
import CleanerDashboard from "./pages/CleanerDashboard";
import NotFound from "./pages/NotFound";
import AvailabilityTest from "./pages/AvailabilityTest";
import { AvailabilityCalendar } from "./components/AvailabilityCalendar";
import AuthWrapper from "./components/AuthWrapper";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'cleaner' }) => {
  return <AuthWrapper requiredRole={requiredRole}>{children}</AuthWrapper>;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/cleaner" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          
          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/cleaner" element={
            <ProtectedRoute requiredRole="cleaner">
              <CleanerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Legacy Routes - Keep for backward compatibility */}
          <Route path="/availability/:uniqueLink" element={<AvailabilityCalendar />} />
          <Route path="/test-availability" element={<AvailabilityTest />} />
          
          {/* Root Route - Redirects based on authentication */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
