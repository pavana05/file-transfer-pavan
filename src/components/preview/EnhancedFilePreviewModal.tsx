import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './pdf-viewer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EnhancedFilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

const EnhancedFilePreviewModal: React.FC<EnhancedFilePreviewModalProps> = ({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf' || fileType.includes('pdf');

  useEffect(() => {
    // Reset state when modal opens
    if (open) {
      setZoom(100);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setPageNumber(1);
    }
  }, [open]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -25 : 25;
      setZoom(prev => Math.min(Math.max(prev + delta, 25), 400));
    }
  };

  const handleDownload = async () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{fileName}</h3>
            <p className="text-sm text-muted-foreground">{fileType}</p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 px-3">
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={25}
                max={400}
                step={25}
                className="w-32"
              />
              <span className="text-sm font-medium w-12 text-center">
                {zoom}%
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 400}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {isImage && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {isPDF && numPages > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-muted/20 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {isImage ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                }}
                draggable={false}
              />
            ) : isPDF ? (
              <div className="pdf-container">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom / 100}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            ) : (
              <div className="text-center p-8">
                <Maximize2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFilePreviewModal;
