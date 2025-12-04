import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthMeter from '@/components/upload/PasswordStrengthMeter';
import { Upload, Shield, Lock, Eye, EyeOff, Mail, ArrowLeft, Sparkles, Github, ArrowRight } from 'lucide-react';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

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

// Forgot Password Schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const signUpPassword = signUpForm.watch('password');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setError('');
    setMessage('');
    signInForm.reset();
    signUpForm.reset();
    forgotPasswordForm.reset();
    setShowPassword(false);
    setShowForgotPassword(false);
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

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link sent! Check your email to reset your password.');
      forgotPasswordForm.reset();
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setError(error.message);
      setSocialLoading(null);
    }
  };

  // Social Login Buttons Component
  const SocialLoginButtons = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground font-semibold">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={socialLoading !== null}
          className="h-14 border-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 rounded-xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-3">
            {socialLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="font-semibold text-sm">Google</span>
          </div>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('github')}
          disabled={socialLoading !== null}
          className="h-14 border-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 rounded-xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-3">
            {socialLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            <span className="font-semibold text-sm">GitHub</span>
          </div>
        </Button>
      </div>
    </div>
  );

  // Forgot Password Form Component
  const ForgotPasswordForm = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mb-4 shadow-lg shadow-primary/30">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Reset Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="forgot-email" className="text-sm font-bold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Address
          </Label>
          <div className="relative group">
            <Input
              id="forgot-email"
              type="email"
              {...forgotPasswordForm.register('email')}
              className="h-14 text-base bg-background/90 backdrop-blur-sm border-2 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-background rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/50 font-medium pl-4"
              placeholder="you@example.com"
            />
          </div>
          {forgotPasswordForm.formState.errors.email && (
            <p className="text-sm text-destructive font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
              {forgotPasswordForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="group relative w-full h-14 bg-gradient-to-r from-primary via-primary-dark to-primary hover:from-primary hover:via-primary-dark hover:to-primary-dark text-white font-bold shadow-xl shadow-primary/30 hover:shadow-[0_15px_30px_-8px_hsl(var(--primary)/0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden"
          disabled={loading || !forgotPasswordForm.formState.isValid}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          {loading ? (
            <div className="relative flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-bold">Sending Link...</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center gap-3">
              <Mail className="w-5 h-5" />
              <span className="font-bold">Send Reset Link</span>
            </div>
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setShowForgotPassword(false);
          setError('');
          setMessage('');
        }}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-semibold py-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Professional Dual-Panel Background System */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent hidden lg:block" />
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-accent/12 via-accent/6 to-transparent rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
      </div>
      
      {/* Premium Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/40 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="group flex items-center gap-2.5 text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl px-4 py-2.5 hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-semibold">Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Split-Screen Professional Layout */}
      <div className="relative z-10 flex min-h-screen pt-20">
        {/* Left Panel - Visual Content (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="relative z-10 max-w-lg">
            {/* Animated Hero Icon */}
            <div className="flex justify-center mb-12 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary/80 rounded-[2rem] shadow-2xl shadow-primary/40 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-transparent opacity-60 rounded-[2rem] blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                <div className="absolute inset-2 bg-gradient-to-tl from-white/40 via-white/20 to-transparent rounded-[1.75rem]" />
                <div className="relative w-28 h-28 rounded-[2rem] backdrop-blur-sm flex items-center justify-center">
                  <Upload className="w-14 h-14 text-white drop-shadow-2xl" />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-accent via-accent-foreground to-accent/90 border-4 border-background shadow-2xl flex items-center justify-center animate-pulse" style={{ animationDuration: '2.5s' }}>
                  <Shield className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl font-black tracking-tight mb-6 text-center">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Secure File Sharing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-center leading-relaxed font-medium mb-12">
              Enterprise-grade encryption protecting your files with military-level security
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">256-bit</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Encryption</p>
              </div>
              <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">100%</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Secure</p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl hover:bg-card/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">End-to-End Encryption</p>
                  <p className="text-sm text-muted-foreground">Military-grade protection</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl hover:bg-card/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Password Protection</p>
                  <p className="text-sm text-muted-foreground">Extra security layer</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl hover:bg-card/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Instant Sharing</p>
                  <p className="text-sm text-muted-foreground">Share files in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="text-center mb-10 lg:hidden animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl shadow-2xl shadow-primary/30 animate-pulse" style={{ animationDuration: '3s' }} />
                  <div className="relative w-20 h-20 rounded-3xl backdrop-blur-sm flex items-center justify-center border-4 border-background">
                    <Upload className="w-10 h-10 text-white drop-shadow-2xl" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </h1>
              <p className="text-base text-muted-foreground font-medium">
                Sign in to your secure account
              </p>
            </div>

            {/* Premium Auth Card */}
            <Card className="relative bg-card/50 backdrop-blur-2xl border-2 border-border/50 shadow-2xl overflow-hidden group animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-card" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_50%)]" />
              
              <CardContent className="relative z-10 p-8 sm:p-10">
                {showForgotPassword ? (
                  <ForgotPasswordForm />
                ) : (
                  <>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40 backdrop-blur-sm p-2 rounded-2xl border-2 border-border/40 shadow-inner">
                        <TabsTrigger 
                          value="signin" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:via-primary data-[state=active]:to-primary-dark data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-xl h-12 font-bold text-sm"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Sign In
                        </TabsTrigger>
                        <TabsTrigger 
                          value="signup"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:via-primary data-[state=active]:to-primary-dark data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300 rounded-xl h-12 font-bold text-sm"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Sign Up
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="signin" className="space-y-0 mt-2">
                        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-5">
                          <div className="space-y-3">
                            <Label htmlFor="signin-email" className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Email Address
                            </Label>
                            <div className="relative group">
                              <Input
                                id="signin-email"
                                type="email"
                                {...signInForm.register('email')}
                                className="h-14 text-base bg-background/90 backdrop-blur-sm border-2 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-background rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/50 font-medium pl-4"
                                placeholder="you@example.com"
                              />
                            </div>
                            {signInForm.formState.errors.email && (
                              <p className="text-sm text-destructive font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                {signInForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="signin-password" className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Lock className="w-4 h-4 text-primary" />
                              Password
                            </Label>
                            <div className="relative group">
                              <Input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                {...signInForm.register('password')}
                                className="pr-14 h-14 text-base bg-background/90 backdrop-blur-sm border-2 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-background rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/50 font-medium pl-4"
                                placeholder="Enter your password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-primary/10"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {signInForm.formState.errors.password && (
                              <p className="text-sm text-destructive font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                {signInForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          {/* Forgot Password Link */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotPassword(true);
                                setError('');
                                setMessage('');
                              }}
                              className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors duration-300 flex items-center gap-1 group"
                            >
                              Forgot password?
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="group relative w-full h-14 bg-gradient-to-r from-primary via-primary-dark to-primary hover:from-primary hover:via-primary-dark hover:to-primary-dark text-white font-bold shadow-xl shadow-primary/30 hover:shadow-[0_15px_30px_-8px_hsl(var(--primary)/0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden"
                            disabled={loading || !signInForm.formState.isValid}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            {loading ? (
                              <div className="relative flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="font-bold">Signing In...</span>
                              </div>
                            ) : (
                              <div className="relative flex items-center justify-center gap-3">
                                <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                <span className="font-bold">Sign In</span>
                              </div>
                            )}
                          </Button>
                        </form>

                        <div className="mt-6">
                          <SocialLoginButtons />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="signup" className="space-y-0 mt-2">
                        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-5">
                          <div className="space-y-3">
                            <Label htmlFor="signup-email" className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Email Address
                            </Label>
                            <div className="relative group">
                              <Input
                                id="signup-email"
                                type="email"
                                {...signUpForm.register('email')}
                                className="h-14 text-base bg-background/90 backdrop-blur-sm border-2 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-background rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/50 font-medium pl-4"
                                placeholder="you@example.com"
                              />
                            </div>
                            {signUpForm.formState.errors.email && (
                              <p className="text-sm text-destructive font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                {signUpForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="signup-password" className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Lock className="w-4 h-4 text-primary" />
                              Password
                            </Label>
                            <div className="relative group">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                {...signUpForm.register('password')}
                                className="pr-14 h-14 text-base bg-background/90 backdrop-blur-sm border-2 border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-background rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/50 font-medium pl-4"
                                placeholder="Create a secure password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-primary/10"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {signUpForm.formState.errors.password && (
                              <p className="text-sm text-destructive font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                {signUpForm.formState.errors.password.message}
                              </p>
                            )}
                            
                            {signUpPassword && <PasswordStrengthMeter password={signUpPassword} />}
                            
                            {!signUpPassword && (
                              <div className="text-xs text-muted-foreground bg-muted/40 px-4 py-3 rounded-xl border-2 border-border/30 space-y-1.5">
                                <p className="font-bold text-foreground">Password Requirements:</p>
                                <ul className="list-none space-y-1 ml-1">
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    At least 8 characters long
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Contains uppercase and lowercase letters
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Contains at least one number
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Contains at least one special character (!@#$%^&*)
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="group relative w-full h-14 bg-gradient-to-r from-primary via-primary-dark to-primary hover:from-primary hover:via-primary-dark hover:to-primary-dark text-white font-bold shadow-xl shadow-primary/30 hover:shadow-[0_15px_30px_-8px_hsl(var(--primary)/0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden mt-2"
                            disabled={loading || !signUpForm.formState.isValid}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            {loading ? (
                              <div className="relative flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="font-bold">Creating Account...</span>
                              </div>
                            ) : (
                              <div className="relative flex items-center justify-center gap-3">
                                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-bold">Create Account</span>
                              </div>
                            )}
                          </Button>
                        </form>

                        <div className="mt-6">
                          <SocialLoginButtons />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}

                {error && (
                  <Alert className="mt-6 border-2 border-destructive/30 bg-destructive/10 backdrop-blur-sm animate-fade-in rounded-xl" variant="destructive">
                    <Shield className="h-5 w-5" />
                    <AlertDescription className="text-sm font-semibold ml-2">{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="mt-6 border-2 border-primary/30 bg-primary/10 backdrop-blur-sm animate-fade-in rounded-xl">
                    <Mail className="h-5 w-5 text-primary" />
                    <AlertDescription className="text-sm font-semibold text-primary ml-2">{message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Security Badge */}
            <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center gap-3 bg-card/60 backdrop-blur-xl border-2 border-border/30 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <Shield className="w-5 h-5 text-primary" />
                <p className="text-sm text-foreground font-bold">
                  256-bit Encryption Secured
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
