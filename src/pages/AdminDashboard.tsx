import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BookingCalendar } from '@/components/BookingCalendar';
import { CleanerManagement } from '@/components/CleanerManagement';
import { AvailabilityManagement } from '@/components/AvailabilityManagement';
import { MigrationTool } from '@/components/MigrationTool';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Link, RefreshCw, LogOut, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'cleaners' | 'availability' | 'migration'>('calendar');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (user.role !== 'admin') {
      navigate('/cleaner');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 safe-area-top">
      {/* Header */}
      <div className="bg-white ios-shadow border-b safe-area-top">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="ios-gradient-primary text-white">
                  <Building2 className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="ios-text-headline font-semibold text-gray-900">Welcome, {user.name}</h1>
                <p className="ios-text-caption text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 ios-press"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Property Booking Manager
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your property bookings with HostexAPI integration
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-end mb-6">
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'calendar' ? 'default' : 'outline'}
              onClick={() => setActiveTab('calendar')}
              className="flex items-center space-x-2 ios-press ios-rounded"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </Button>
            <Button
              variant={activeTab === 'cleaners' ? 'default' : 'outline'}
              onClick={() => setActiveTab('cleaners')}
              className="flex items-center space-x-2 ios-press ios-rounded"
            >
              <Users className="w-4 h-4" />
              <span>Cleaners</span>
            </Button>
            <Button
              variant={activeTab === 'availability' ? 'default' : 'outline'}
              onClick={() => setActiveTab('availability')}
              className="flex items-center space-x-2 ios-press ios-rounded"
            >
              <Link className="w-4 h-4" />
              <span>Availability</span>
            </Button>
            <Button
              variant={activeTab === 'migration' ? 'default' : 'outline'}
              onClick={() => setActiveTab('migration')}
              className="flex items-center space-x-2 ios-press ios-rounded"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Migration</span>
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && <BookingCalendar />}
        {activeTab === 'cleaners' && <CleanerManagement />}
        {activeTab === 'availability' && <AvailabilityManagement />}
        {activeTab === 'migration' && <MigrationTool />}
      </div>
    </div>
  );
};

export default AdminDashboard;
