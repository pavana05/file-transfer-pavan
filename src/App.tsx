import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import FileShare from "./pages/FileShare";
import CollectionShare from "./pages/CollectionShare";
import PinAccess from "./pages/PinAccess";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ScanQR from "./pages/ScanQR";
import LoadingDemo from "./pages/LoadingDemo";
import NotFound from "./pages/NotFound";
import OfflineIndicator from "./components/offline/OfflineIndicator";
import { registerServiceWorker } from "./lib/service-worker";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker().catch((error) => {
      console.error('Failed to register service worker:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <AuthProvider>
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/share/:token" element={<FileShare />} />
              <Route path="/collection/:token" element={<CollectionShare />} />
              <Route path="/pin" element={<PinAccess />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/loading-demo" element={<LoadingDemo />} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
