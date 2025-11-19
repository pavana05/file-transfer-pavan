export interface DownloadProgress {
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number;
  timeRemaining: number;
}

export class DownloadTracker {
  private startTime: number = 0;
  private lastUpdate: number = 0;
  private lastBytes: number = 0;
  private speedHistory: number[] = [];
  private readonly maxSpeedSamples = 10;

  constructor() {
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.lastUpdate = this.startTime;
    this.lastBytes = 0;
    this.speedHistory = [];
  }

  update(downloadedBytes: number, totalBytes: number): DownloadProgress {
    const now = Date.now();
    const timeDelta = (now - this.lastUpdate) / 1000; // seconds
    
    if (timeDelta > 0.1) { // Update at most 10 times per second
      const bytesDelta = downloadedBytes - this.lastBytes;
      const instantSpeed = bytesDelta / timeDelta;
      
      // Add to speed history
      this.speedHistory.push(instantSpeed);
      if (this.speedHistory.length > this.maxSpeedSamples) {
        this.speedHistory.shift();
      }
      
      this.lastUpdate = now;
      this.lastBytes = downloadedBytes;
    }

    // Calculate average speed
    const avgSpeed = this.speedHistory.length > 0
      ? this.speedHistory.reduce((a, b) => a + b, 0) / this.speedHistory.length
      : 0;

    // Calculate time remaining
    const remainingBytes = totalBytes - downloadedBytes;
    const timeRemaining = avgSpeed > 0 ? remainingBytes / avgSpeed : 0;

    // Calculate progress percentage
    const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;

    return {
      progress: Math.min(progress, 100),
      downloadedBytes,
      totalBytes,
      speed: avgSpeed,
      timeRemaining,
    };
  }
}

export const downloadFileWithProgress = async (
  url: string,
  filename: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch file');
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let downloadedBytes = 0;
  
  const tracker = new DownloadTracker();

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    chunks.push(value);
    downloadedBytes += value.length;
    
    if (onProgress && totalBytes > 0) {
      const progress = tracker.update(downloadedBytes, totalBytes);
      onProgress(progress);
    }
  }

  // Create blob and download
  const blob = new Blob(chunks as BlobPart[]);
  const downloadUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export const addToAccessHistory = (
  pin: string,
  fileName: string,
  fileSize: number,
  fileType: string
) => {
  const historyKey = 'fileAccessHistory';
  const maxHistoryItems = 10;
  
  const stored = localStorage.getItem(historyKey);
  const history = stored ? JSON.parse(stored) : [];
  
  // Remove duplicate if exists
  const filtered = history.filter((item: any) => item.pin !== pin);
  
  // Add new item at the beginning
  const newItem = {
    pin,
    fileName,
    fileSize,
    fileType,
    accessedAt: new Date().toISOString(),
  };
  
  filtered.unshift(newItem);
  
  // Keep only max items
  const trimmed = filtered.slice(0, maxHistoryItems);
  
  localStorage.setItem(historyKey, JSON.stringify(trimmed));
};
