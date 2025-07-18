import React, { useState } from "react";
import { Upload, Share2, CheckCircle, Shield, Zap, Globe, Users, ArrowRight, Download, Eye, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import NearbyShareDialog from "@/components/nearbyShare/NearbyShareDialog";
import { FileUploadManager } from "@/components/upload/FileUploadManager";
import { UploadConfig, UploadCallbacks } from "@/types/upload";
const Index = () => {
  const [isNearbyShareOpen, setIsNearbyShareOpen] = useState(false);
  const [flightCode, setFlightCode] = useState("");
  const uploadConfig: UploadConfig = {
    maxFileSize: 100 * 1024 * 1024,
    // 100MB
    acceptedTypes: ["image/*", "video/*", "audio/*", "application/pdf", "application/msword", "text/plain", "application/zip"],
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "mp4", "mp3", "pdf", "doc", "docx", "txt", "zip", "rar"],
    autoUpload: true,
    enablePreview: true
  };
  const uploadCallbacks: UploadCallbacks = {
    onFileAdd: (files) => {
      console.log("Files added:", files);
    },
    onUploadComplete: (file) => {
      console.log("Upload complete:", file);
    },
    onUploadError: (file, error) => {
      console.error("Upload error:", file, error);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">FILESHARE</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Portfolio ↗
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between px-6 py-20 max-w-7xl mx-auto">
        <div className="lg:w-1/2 space-y-8">
          <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground">SHARE.</span><br />
            <span className="text-foreground">FILES.</span><br />
            <span className="text-primary">INSTANTLY.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md">
            The fastest and most private way to send files — peer to peer.
          </p>
          
          <p className="text-sm text-muted-foreground">
            No cloud. No limits. Just you and the receiver.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground">End-to-end encrypted transfers</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground">No file size limits</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground">Works across all devices</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground">Instant peer-to-peer sharing</span>
            </div>
          </div>
        </div>

        {/* Transfer Card */}
        <div className="lg:w-96 mt-12 lg:mt-0">
          <Card className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-xl">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-xs font-medium mb-2">FILESHARE APP</div>
                <h2 className="text-2xl font-bold">Transfer</h2>
                <p className="text-sm opacity-90">Your file transfer ticket</p>
              </div>

              <Button onClick={() => setIsNearbyShareOpen(true)} className="w-full bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl py-3">
                Tap to start sending
              </Button>

              <div className="text-center text-xs opacity-75">
                SELECT FILES OR FOLDER TO SEND
              </div>
              
              <div className="text-center text-sm opacity-90">OR</div>

              <div className="space-y-3">
                <Input value={flightCode} onChange={e => setFlightCode(e.target.value)} placeholder="Flight#" className="bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-xl" />
                <div className="text-xs text-center opacity-75">
                  ENTER YOUR FLIGHT CODE TO RECEIVE
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Upload Section */}
      <section className="px-6 py-20 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Upload & Share in Seconds</h2>
          <p className="text-muted-foreground mb-12">
            Drag and drop your files or click to browse. We support all file types up to 2GB each.
          </p>

          <div className="mb-8">
            <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
          </div>

          <div className="text-xs text-muted-foreground space-x-4">
            <span>• Any file type</span>
            <span>• Up to 2GB per file</span>
            <span>• Unlimited files</span>
            <span>• No registration required</span>
          </div>

          
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              WHY CHOOSE <span className="text-primary">FILESHARE?</span>
            </h2>
            <p className="text-muted-foreground">
              The most advanced file sharing platform designed for modern workflows
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Transfer files at maximum speed with our optimized peer-to-peer technology.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">End-to-End Encrypted</h3>
              <p className="text-sm text-muted-foreground">
                Your files are encrypted during transfer and automatically deleted after expiry.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Cross-Platform</h3>
              <p className="text-sm text-muted-foreground">
                Works seamlessly across all devices and operating systems.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Global Network</h3>
              <p className="text-sm text-muted-foreground">
                Access your shared files from anywhere in the world securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-6 py-20 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Everything you need.<br />
                <span className="text-primary">Nothing you don't.</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Experience file sharing the way it should be - simple, fast, and secure.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>No file size limits</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>No cloud storage needed</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Works offline-first</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>No registration required</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>No bandwidth throttling</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Privacy by design</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                <div>
                  <div className="text-4xl font-bold text-primary">10M+</div>
                  <div className="text-sm text-muted-foreground">Files Shared</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="text-4xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">50TB</div>
                  <div className="text-sm text-muted-foreground">Data Transferred</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-xl">
            Start Sharing Now →
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            No signup required • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center">
        <div className="text-sm text-muted-foreground">
          Built with ❤️ by <span className="text-primary">PAVAN</span> • 2025 FileShare
        </div>
      </footer>

      {/* Nearby Share Dialog */}
      <NearbyShareDialog trigger={<div style={{
      display: 'none'
    }} />} />
    </div>;
};
export default Index;