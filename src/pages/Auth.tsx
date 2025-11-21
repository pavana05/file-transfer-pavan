import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import PasswordStrengthMeter from '@/components/upload/PasswordStrengthMeter';
import { Upload, Shield, Lock, Eye, EyeOff, Mail, ArrowLeft, Sparkles } from 'lucide-react';

// Sign In Schema - basic validation
const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Sign Up Schema - comprehensive validation with strong password requirements
const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .refine(
      (email) => {
        // Additional email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      { message: 'Please enter a valid email format' }
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .refine(
      (password) => /[a-z]/.test(password),
      { message: 'Password must contain at least one lowercase letter' }
    )
    .refine(
      (password) => /[A-Z]/.test(password),
      { message: 'Password must contain at least one uppercase letter' }
    )
    .refine(
      (password) => /[0-9]/.test(password),
      { message: 'Password must contain at least one number' }
    )
    .refine(
      (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      { message: 'Password must contain at least one special character' }
    ),
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Sign In Form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  // Sign Up Form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  // Watch password for strength meter
  const signUpPassword = signUpForm.watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Reset forms when switching tabs
  useEffect(() => {
    setError('');
    setMessage('');
    signInForm.reset();
    signUpForm.reset();
    setShowPassword(false);
  }, [activeTab]);

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await signUp(data.email, data.password);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('Password should be at least')) {
        setError('Password does not meet security requirements. Please try a stronger password.');
      } else {
        setError(error.message);
      }
    } else {
      setMessage('Success! Check your email for the confirmation link to activate your account.');
      signUpForm.reset();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Professional Background System */}
      <div className="absolute inset-0">
        {/* Base gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.06),transparent_50%)]" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/6 via-accent/3 to-transparent rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/4 to-accent/4 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
      </div>
      
      {/* Enhanced Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg px-3 py-2 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Professional Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Enhanced Header with Premium Icon */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Premium multi-layer icon design */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl shadow-2xl shadow-primary/30 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent opacity-50 rounded-3xl blur-xl" />
                <div className="absolute inset-1 bg-gradient-to-tl from-white/30 via-white/10 to-transparent rounded-3xl" />
                <div className="relative w-20 h-20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white drop-shadow-2xl" />
                </div>
                {/* Premium badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent via-accent to-accent/80 border-2 border-background shadow-xl flex items-center justify-center animate-pulse" style={{ animationDuration: '2s' }}>
                  <Shield className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
                Welcome Back
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              Sign in to access your secure file transfers and manage your shares
            </p>
          </div>

          {/* Enhanced Professional Auth Card */}
          <Card className="relative bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/10 overflow-hidden group animate-scale-in">
            {/* Enhanced Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.06),transparent_60%)]" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            
            <CardContent className="relative z-10 p-6 sm:p-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/30 backdrop-blur-sm p-1.5 rounded-xl border border-border/30">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg h-11 font-semibold"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg h-11 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-0 mt-2">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                        <Input
                          id="signin-email"
                          type="email"
                          {...signInForm.register('email')}
                          className="pl-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/60 focus:border-primary/50 focus:bg-background rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          placeholder="you@example.com"
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-destructive font-medium">
                          {signInForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          {...signInForm.register('password')}
                          className="pl-12 pr-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/60 focus:border-primary/50 focus:bg-background rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 p-1 rounded-lg hover:bg-muted/50"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-destructive font-medium">
                          {signInForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="group relative w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] text-base rounded-xl overflow-hidden mt-8"
                      disabled={loading || !signInForm.formState.isValid}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      {loading ? (
                        <div className="relative flex items-center gap-3">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-bold">Signing In...</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-3">
                          <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="font-bold">Sign In to Account</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-0 mt-2">
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                        <Input
                          id="signup-email"
                          type="email"
                          {...signUpForm.register('email')}
                          className="pl-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/60 focus:border-primary/50 focus:bg-background rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          placeholder="you@example.com"
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-destructive font-medium">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          {...signUpForm.register('password')}
                          className="pl-12 pr-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/60 focus:border-primary/50 focus:bg-background rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          placeholder="Create a secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 p-1 rounded-lg hover:bg-muted/50"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-destructive font-medium">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                      
                      {/* Password Strength Meter */}
                      {signUpPassword && <PasswordStrengthMeter password={signUpPassword} />}
                      
                      {!signUpPassword && (
                        <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2.5 rounded-lg border border-border/30 space-y-1">
                          <p className="font-semibold">Password Requirements:</p>
                          <ul className="list-disc list-inside space-y-0.5 ml-1">
                            <li>At least 8 characters long</li>
                            <li>Contains uppercase and lowercase letters</li>
                            <li>Contains at least one number</li>
                            <li>Contains at least one special character (!@#$%^&*)</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="group relative w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] text-base rounded-xl overflow-hidden mt-8"
                      disabled={loading || !signUpForm.formState.isValid}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      {loading ? (
                        <div className="relative flex items-center gap-3">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-bold">Creating Account...</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-3">
                          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-bold">Create Account</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Enhanced Alerts */}
              {error && (
                <Alert className="mt-8 border-2 border-destructive/30 bg-destructive/10 backdrop-blur-sm animate-fade-in rounded-xl" variant="destructive">
                  <Shield className="h-5 w-5" />
                  <AlertDescription className="text-sm font-medium ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="mt-8 border-2 border-primary/30 bg-primary/10 backdrop-blur-sm animate-fade-in rounded-xl">
                  <Mail className="h-5 w-5 text-primary" />
                  <AlertDescription className="text-sm font-medium text-primary ml-2">{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Security Note */}
          <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center gap-3 bg-card/40 backdrop-blur-md border border-border/40 px-6 py-3 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">
                Enterprise-grade security with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}