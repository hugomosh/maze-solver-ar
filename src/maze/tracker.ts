// src/maze/tracker.ts
import { MazeData, Point, VideoFrame } from "../types";

export class MazeTracker {
  private lastFrame: VideoFrame | null = null;
  private referencePoints: Point[] = [];
  private transformMatrix: number[] | null = null;

  /**
   * Initialize the tracker with reference frame and maze data
   */
  public initialize(frame: VideoFrame, maze: MazeData): void {
    this.lastFrame = frame;
    this.extractReferencePoints(maze);
  }

  /**
   * Track maze position in a new frame
   * Returns transform matrix to map from original to current position
   */
  public track(newFrame: VideoFrame): number[] | null {
    if (!this.lastFrame || this.referencePoints.length === 0) {
      return null;
    }

    // Find feature points in new frame that match the reference points
    const matchedPoints = this.findFeatureMatches(newFrame);

    if (matchedPoints.length < 4) {
      // Not enough matches to establish transformation
      return null;
    }

    // Calculate homography matrix between reference and current points
    this.transformMatrix = this.calculateHomography(
      this.referencePoints.slice(0, matchedPoints.length),
      matchedPoints
    );

    // Update last frame for next tracking
    this.lastFrame = newFrame;

    return this.transformMatrix;
  }

  /**
   * Extract reference points from the maze (e.g., corners, distinctive features)
   */
  private extractReferencePoints(maze: MazeData): void {
    // For simplicity, we'll use the corners of the maze as reference points
    // In a real implementation, we would detect more robust feature points

    this.referencePoints = [
      { x: 0, y: 0 },
      { x: maze.width - 1, y: 0 },
      { x: maze.width - 1, y: maze.height - 1 },
      { x: 0, y: maze.height - 1 },
    ];

    // Add additional reference points along the edges
    const step = Math.max(
      30,
      Math.floor(Math.min(maze.width, maze.height) / 10)
    );

    // Add points along top and bottom edges
    for (let x = step; x < maze.width - step; x += step) {
      this.referencePoints.push({ x, y: 0 });
      this.referencePoints.push({ x, y: maze.height - 1 });
    }

    // Add points along left and right edges
    for (let y = step; y < maze.height - step; y += step) {
      this.referencePoints.push({ x: 0, y });
      this.referencePoints.push({ x: maze.width - 1, y });
    }
  }

  /**
   * Find features in the new frame that match the reference points
   * For simplicity, we'll simulate feature tracking with a small offset
   */
  private findFeatureMatches(newFrame: VideoFrame): Point[] {
    // In a real implementation, we would use optical flow or feature matching
    // For this example, we'll simulate tracking with a slight offset

    // Simulate camera movement with a small shift
    const offsetX = Math.floor(Math.random() * 5) - 2;
    const offsetY = Math.floor(Math.random() * 5) - 2;

    return this.referencePoints.map((point) => ({
      x: Math.min(Math.max(0, point.x + offsetX), newFrame.width - 1),
      y: Math.min(Math.max(0, point.y + offsetY), newFrame.height - 1),
    }));
  }

  /**
   * Calculate homography matrix between two sets of corresponding points
   * This is a simplified version that returns an identity transformation
   */
  private calculateHomography(
    srcPoints: Point[],
    dstPoints: Point[]
  ): number[] {
    // In a real implementation, we would compute a proper homography matrix
    // For this example, we'll return a simple translation matrix

    if (srcPoints.length < 4 || dstPoints.length < 4) {
      // Return identity matrix if not enough points
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }

    // Calculate average translation
    let sumDx = 0;
    let sumDy = 0;

    for (let i = 0; i < srcPoints.length; i++) {
      sumDx += dstPoints[i].x - srcPoints[i].x;
      sumDy += dstPoints[i].y - srcPoints[i].y;
    }

    const avgDx = sumDx / srcPoints.length;
    const avgDy = sumDy / srcPoints.length;

    // Return a translation matrix
    return [1, 0, avgDx, 0, 1, avgDy, 0, 0, 1];
  }

  /**
   * Transform a point using the current transform matrix
   */
  public transformPoint(point: Point): Point {
    if (!this.transformMatrix) {
      return point;
    }

    const [a, b, c, d, e, f, g, h, i] = this.transformMatrix;

    const denominator = g * point.x + h * point.y + i;

    return {
      x: (a * point.x + b * point.y + c) / denominator,
      y: (d * point.x + e * point.y + f) / denominator,
    };
  }

  /**
   * Transform a path using the current transform matrix
   */
  public transformPath(path: Point[]): Point[] {
    return path.map((point) => this.transformPoint(point));
  }
}
