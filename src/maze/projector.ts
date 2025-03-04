// src/maze/projector.ts
import { MazeData, MazeSolution, Point, VideoFrame } from "../types";
import { MazeTracker } from "./tracker";

export class MazeProjector {
  private tracker: MazeTracker;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private maze: MazeData | null = null;
  private solution: MazeSolution | null = null;
  private isTracking: boolean = false;

  constructor() {
    this.tracker = new MazeTracker();
    this.canvas = document.getElementById("overlay") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Initialize the projector with a maze and its solution
   */
  public initialize(
    frame: VideoFrame,
    maze: MazeData,
    solution: MazeSolution
  ): void {
    this.maze = maze;
    this.solution = solution;
    this.tracker.initialize(frame, maze);
    this.isTracking = true;
  }

  /**
   * Start tracking and projecting the solution
   */
  public startProjection(): void {
    this.isTracking = true;
    this.update();
  }

  /**
   * Stop the projection
   */
  public stopProjection(): void {
    this.isTracking = false;
  }

  /**
   * Update the projection with a new camera frame
   */
  public update(newFrame?: VideoFrame): void {
    if (
      !this.isTracking ||
      !this.maze ||
      !this.solution ||
      !this.solution.found
    ) {
      return;
    }

    if (newFrame) {
      // Track maze in the new frame
      this.tracker.track(newFrame);
    }

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Transform and draw the solution path
    this.drawTransformedSolution();

    // Schedule next update (simulate real-time tracking)
    if (this.isTracking) {
      requestAnimationFrame(() => this.update());
    }
  }

  /**
   * Draw the solution transformed according to the current camera position
   */
  private drawTransformedSolution(): void {
    if (!this.solution || !this.solution.found) {
      return;
    }

    // Transform the solution path
    const transformedPath = this.tracker.transformPath(this.solution.path);

    // Draw path
    this.ctx.beginPath();
    this.ctx.moveTo(transformedPath[0].x, transformedPath[0].y);

    for (let i = 1; i < transformedPath.length; i++) {
      this.ctx.lineTo(transformedPath[i].x, transformedPath[i].y);
    }

    // Style the path with a glowing effect for AR feel
    this.ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();

    // Add inner line for better visibility
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw start and end points
    if (transformedPath.length > 0) {
      // Start point
      this.drawARPoint(transformedPath[0], "rgba(0, 255, 0, 0.8)");

      // End point
      this.drawARPoint(
        transformedPath[transformedPath.length - 1],
        "rgba(255, 0, 0, 0.8)"
      );
    }
  }

  /**
   * Draw a point with AR-like appearance
   */
  private drawARPoint(point: Point, color: string): void {
    // Outer glow
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = color.replace("0.8", "0.3");
    this.ctx.fill();

    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Center dot
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
  }
}
