import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import './pdf-viewer.css';

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
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [PdfComponents, setPdfComponents] = useState<{ Document: any; Page: any } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf' || fileType.includes('pdf');

  // Lazy load react-pdf only when needed
  useEffect(() => {
    if (open && isPDF && !PdfComponents) {
      import('react-pdf').then((module) => {
        import('react-pdf/dist/Page/AnnotationLayer.css');
        import('react-pdf/dist/Page/TextLayer.css');
        module.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${module.pdfjs.version}/build/pdf.worker.min.mjs`;
        setPdfComponents({ Document: module.Document, Page: module.Page });
        setPdfLoaded(true);
      }).catch(err => {
        console.error('Failed to load PDF viewer:', err);
      });
    }
  }, [open, isPDF, PdfComponents]);

  useEffect(() => {
    if (open) {
      setZoom(100);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setPageNumber(1);
    }
  }, [open]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -25 : 25;
      setZoom(prev => Math.min(Math.max(prev + delta, 25), 400));
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] sm:h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-sm truncate">{fileName}</h3>
            <p className="text-xs text-muted-foreground truncate">{fileType}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b bg-muted/20">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 25} className="h-8 w-8">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1 px-1">
              <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={25} max={400} step={25} className="w-20 sm:w-28" />
              <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 400} className="h-8 w-8">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            {isImage && (
              <Button variant="outline" size="icon" onClick={handleRotate} className="h-8 w-8">
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleReset} className="h-8 px-2 text-xs">Reset</Button>
          </div>

          <div className="flex items-center gap-1">
            {isPDF && numPages > 0 && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1} className="h-8 w-8">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-medium whitespace-nowrap px-1">{pageNumber}/{numPages}</span>
                <Button variant="outline" size="icon" onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages} className="h-8 w-8">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 px-2 text-xs gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-muted/10 relative"
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
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)` }}
                draggable={false}
              />
            ) : isPDF && PdfComponents ? (
              <div className="pdf-container">
                <PdfComponents.Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                    </div>
                  }
                >
                  <PdfComponents.Page pageNumber={pageNumber} scale={zoom / 100} rotate={rotation} renderTextLayer={true} renderAnnotationLayer={true} />
                </PdfComponents.Document>
              </div>
            ) : isPDF && !PdfComponents ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="text-center p-8">
                <Maximize2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFilePreviewModal;
