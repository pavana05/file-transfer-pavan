import React from "react";
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
import Index from "./pages/Index";
import FileShare from "./pages/FileShare";
import CollectionShare from "./pages/CollectionShare";
import PinAccess from "./pages/PinAccess";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ScanQR from "./pages/ScanQR";
import Install from "./pages/Install";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import PaymentHistory from "./pages/PaymentHistory";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
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
                <Toaster />
                <Sonner />
                <AnimatedRoutes />
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
