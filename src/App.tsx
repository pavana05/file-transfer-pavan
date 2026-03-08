import React, { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CommandPalette } from "@/components/ui/command-palette";

// Eagerly load the landing page for LCP
import Index from "./pages/Index";

// Lazy load all other routes
const AIChatWidget = lazy(() => import("@/components/chat/AIChatWidget").then(m => ({ default: m.AIChatWidget })));
const FileShare = lazy(() => import("./pages/FileShare"));
const CollectionShare = lazy(() => import("./pages/CollectionShare"));
const PinAccess = lazy(() => import("./pages/PinAccess"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScanQR = lazy(() => import("./pages/ScanQR"));
const Install = lazy(() => import("./pages/Install"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Support = lazy(() => import("./pages/Support"));
const DonorWall = lazy(() => import("./pages/DonorWall"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/" element={<Index />} />
          <Route path="/share/:token" element={<PageTransition><FileShare /></PageTransition>} />
          <Route path="/collection/:token" element={<PageTransition><CollectionShare /></PageTransition>} />
          <Route path="/pin" element={<PageTransition><PinAccess /></PageTransition>} />
          <Route path="/scan" element={<PageTransition><ScanQR /></PageTransition>} />
          <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <PageTransition><Dashboard /></PageTransition>
              </AuthGuard>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
                <PageTransition><Profile /></PageTransition>
              </AuthGuard>
            } 
          />
          <Route 
            path="/payment-history" 
            element={
              <AuthGuard>
                <PageTransition><PaymentHistory /></PageTransition>
              </AuthGuard>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AuthGuard>
                <PageTransition><AdminDashboard /></PageTransition>
              </AuthGuard>
            } 
          />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const DeferredAIChatWidget = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setShow(true), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(id);
    }
  }, []);
  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <AIChatWidget />
    </Suspense>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider delayDuration={0}>
            <AuthProvider>
              <BrowserRouter>
                <ScrollProgress />
                <Toaster />
                <Sonner />
                <AnimatedRoutes />
                <CommandPalette />
                <DeferredAIChatWidget />
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
