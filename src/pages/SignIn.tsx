import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Building2, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SignIn = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'cleaner' as 'admin' | 'cleaner',
  });
  
  const { login, signUp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'login') {
        await login({
          email: formData.email,
          password: formData.password,
        });
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });
        toast({
          title: "Account created!",
          description: "Welcome to the team.",
        });
      }
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 ios-gradient-primary ios-rounded-xl mb-4 ios-shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="ios-text-title bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cleaning Manager
          </h1>
          <p className="ios-text-body text-gray-600 mt-2">Manage your cleaning operations</p>
        </div>

        {/* Auth Card */}
        <Card className="ios-shadow-lg border-0 bg-white/80 ios-blur ios-rounded-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Join our cleaning management platform'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                                         <Input
                       id="email"
                       type="email"
                       placeholder="Enter your email"
                       value={formData.email}
                       onChange={(e) => handleInputChange('email', e.target.value)}
                       required
                       className="h-12 text-base ios-rounded"
                     />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                                             <Input
                         id="password"
                         type={showPassword ? 'text' : 'password'}
                         placeholder="Enter your password"
                         value={formData.password}
                         onChange={(e) => handleInputChange('password', e.target.value)}
                         required
                         className="h-12 text-base pr-12 ios-rounded"
                       />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium ios-gradient-primary hover:from-blue-600 hover:to-purple-700 ios-press ios-rounded"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="h-12 text-base ios-rounded"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="h-12 text-base ios-rounded"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="h-12 text-base pr-12 ios-rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={formData.role === 'cleaner' ? 'default' : 'outline'}
                        className="h-12 flex items-center justify-center space-x-2"
                        onClick={() => handleInputChange('role', 'cleaner')}
                      >
                        <User className="w-4 h-4" />
                        <span>Cleaner</span>
                      </Button>
                      <Button
                        type="button"
                        variant={formData.role === 'admin' ? 'default' : 'outline'}
                        className="h-12 flex items-center justify-center space-x-2"
                        onClick={() => handleInputChange('role', 'admin')}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Admin</span>
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium ios-gradient-primary hover:from-blue-600 hover:to-purple-700 ios-press ios-rounded"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure authentication powered by Firebase</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
