// src/ui/overlay.ts
import { MazeData, MazeSolution, Point } from "../types";

export class OverlayRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.getElementById("overlay") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Clear the overlay
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw maze representation
   */
  public drawMaze(maze: MazeData): void {
    this.clear();

    // For large mazes, drawing every pixel is inefficient
    // Instead, we'll draw a semi-transparent overlay to highlight walls
    this.ctx.fillStyle = "rgba(40, 40, 100, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clear the fill for path areas
    this.ctx.globalCompositeOperation = "destination-out";

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.grid[y][x]) {
          // This is a path
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Reset composite operation
    this.ctx.globalCompositeOperation = "source-over";

    // Draw start and end points if available
    if (maze.start) {
      this.drawPoint(maze.start, "rgba(0, 255, 0, 0.7)", "START");
    }

    if (maze.end) {
      this.drawPoint(maze.end, "rgba(255, 0, 0, 0.7)", "END");
    }
  }

  /**
   * Draw solution path through the maze
   */
  public drawSolution(solution: MazeSolution): void {
    if (!solution.found || solution.path.length < 2) {
      return;
    }

    // Draw solution path
    this.ctx.strokeStyle = "rgba(255, 42, 109, 0.8)";
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.ctx.beginPath();

    // Start at the first point
    this.ctx.moveTo(solution.path[0].x, solution.path[0].y);

    // Draw line through each point in the path
    for (let i = 1; i < solution.path.length; i++) {
      this.ctx.lineTo(solution.path[i].x, solution.path[i].y);
    }

    this.ctx.stroke();
  }

  /**
   * Draw point on the canvas (for start/end points)
   */
  private drawPoint(point: Point, color: string, label?: string): void {
    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw label if provided
    if (label) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillText(label, point.x, point.y - 15);
    }
  }

  /**
   * Draw a hint to guide the user for point selection
   */
  public drawSelectionHint(message: string): void {
    const x = this.canvas.width / 2;
    const y = 30;

    // Draw background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, 60);

    // Draw text
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 18px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(message, x, y);
  }
}
