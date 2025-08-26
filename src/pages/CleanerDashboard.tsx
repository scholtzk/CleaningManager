import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, LogOut, User, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CleaningAssignment } from '@/types/booking';

// Mock data - replace with real data from your backend
const mockUpcomingShifts: CleaningAssignment[] = [
  {
    id: '1',
    bookingId: 'booking1',
    cleanerId: 'cleaner1',
    date: '2025-01-15',
    status: 'assigned',
    estimatedDuration: 120,
    notes: 'Deep clean required',
    assignedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    bookingId: 'booking2',
    cleanerId: 'cleaner1',
    date: '2025-01-18',
    status: 'assigned',
    estimatedDuration: 90,
    notes: 'Regular turnover',
    assignedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '3',
    bookingId: 'booking3',
    cleanerId: 'cleaner1',
    date: '2025-01-22',
    status: 'assigned',
    estimatedDuration: 150,
    notes: 'Post-party cleanup',
    assignedAt: '2025-01-10T10:00:00Z',
  },
];

const CleanerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [upcomingShifts, setUpcomingShifts] = useState<CleaningAssignment[]>(mockUpcomingShifts);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (user.role !== 'cleaner') {
      navigate('/admin');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 safe-area-top">
      {/* Header */}
      <div className="bg-white ios-shadow border-b safe-area-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="ios-gradient-primary text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="ios-text-headline font-semibold text-gray-900">Welcome, {user.name}</h1>
                <p className="ios-text-caption text-gray-500">Cleaner Dashboard</p>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="shifts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white ios-shadow ios-rounded">
            <TabsTrigger value="shifts" className="ios-text-body font-medium">
              Upcoming Shifts
            </TabsTrigger>
            <TabsTrigger value="availability" className="ios-text-body font-medium">
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shifts" className="space-y-4">
            <div className="grid gap-4">
              {upcomingShifts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming shifts</h3>
                    <p className="text-gray-500">You don't have any shifts scheduled yet.</p>
                  </CardContent>
                </Card>
              ) : (
                                 upcomingShifts.map((shift) => (
                   <Card key={shift.id} className="ios-shadow hover:ios-shadow-lg transition-shadow ios-rounded">
                     <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(shift.status)}
                            <Badge className={getStatusColor(shift.status)}>
                              {shift.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {format(new Date(shift.date), 'EEEE, MMMM d, yyyy')}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {formatDuration(shift.estimatedDuration || 0)}
                              </span>
                            </div>
                            
                            {shift.notes && (
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <span className="text-sm text-gray-600">{shift.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                                                 <div className="text-right">
                           <Button
                             variant="outline"
                             size="sm"
                             className="text-xs ios-press ios-rounded"
                           >
                             View Details
                           </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

                     <TabsContent value="availability" className="space-y-4">
             <Card className="ios-rounded">
               <CardHeader>
                 <CardTitle className="ios-text-headline">Next Month Availability</CardTitle>
                 <CardDescription className="ios-text-body">
                   Set your availability for {format(addMonths(new Date(), 1), 'MMMM yyyy')}
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex justify-center">
                   <Calendar
                     mode="multiple"
                     selected={[]}
                     onSelect={() => {}}
                     month={addMonths(new Date(), 1)}
                     className="ios-rounded border"
                     classNames={{
                       day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                       day_today: "bg-blue-100 text-blue-900",
                       day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                     }}
                   />
                 </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Available</span>
                    </div>
                    <span className="text-sm text-gray-600">0 days selected</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Unavailable</span>
                    </div>
                    <span className="text-sm text-gray-600">0 days selected</span>
                  </div>
                </div>
                
                                 <div className="mt-6 flex space-x-3">
                   <Button className="flex-1 bg-green-600 hover:bg-green-700 ios-press ios-rounded">
                     Mark as Available
                   </Button>
                   <Button variant="outline" className="flex-1 ios-press ios-rounded">
                     Mark as Unavailable
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CleanerDashboard;
