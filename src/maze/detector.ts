// src/maze/detector.ts
import { MazeData, Point, VideoFrame } from '../types';

export class MazeDetector {
  /**
   * Process an image frame to extract maze data
   */
  public detectMaze(frame: VideoFrame): MazeData {
    // Convert to binary (black/white) representation
    const binaryImage = this.convertToBinary(frame);
    
    return {
      grid: binaryImage,
      width: frame.width,
      height: frame.height,
      // Start and end points will be selected by the user
    };
  }

  /**
   * Convert image to binary representation where true represents navigable paths
   * and false represents walls
   */
  private convertToBinary(frame: VideoFrame): boolean[][] {
    const { width, height, imageData } = frame;
    const binaryGrid: boolean[][] = Array(height).fill(0).map(() => Array(width).fill(false));
    const data = imageData.data;
    
    // Apply threshold to determine walls vs paths
    const threshold = this.calculateThreshold(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Calculate grayscale value 
        const grayscale = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // White (>threshold) = path, Black (<threshold) = wall
        binaryGrid[y][x] = grayscale > threshold;
      }
    }
    
    return binaryGrid;
  }

  /**
   * Calculate threshold using Otsu's method for better binarization
   */
  private calculateThreshold(data: Uint8ClampedArray): number {
    // Histogram
    const histogram = new Array(256).fill(0);
    
    // We only need to look at every 4th value (r in rgba)
    for (let i = 0; i < data.length; i += 4) {
      // Simple grayscale conversion
      const value = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      histogram[value]++;
    }
    
    // Total pixels
    const total = data.length / 4;
    
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }
    
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;
    
    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      
      wF = total - wB;
      if (wF === 0) break;
      
      sumB += t * histogram[t];
      
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      
      const variance = wB * wF * (mB - mF) * (mB - mF);
      
      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }
    
    return threshold;
  }
}