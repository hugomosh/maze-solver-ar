// src/maze/solver.ts
import { MazeData, MazeSolution, Point } from '../types';

export class MazeSolver {
  /**
   * Solve the maze using breadth-first search
   */
  public solveMaze(maze: MazeData): MazeSolution {
    if (!maze.start || !maze.end) {
      return { path: [], found: false };
    }
    
    // Convert start/end points to grid coordinates
    const startX = Math.round(maze.start.x);
    const startY = Math.round(maze.start.y);
    const endX = Math.round(maze.end.x);
    const endY = Math.round(maze.end.y);
    
    // Check if start or end are invalid (walls)
    if (!this.isValidPoint(maze, startX, startY) || !this.isValidPoint(maze, endX, endY)) {
      return { path: [], found: false };
    }
    
    // Initialize the queue with the start point
    const queue: { x: number, y: number, path: Point[] }[] = [
      { x: startX, y: startY, path: [{ x: startX, y: startY }] }
    ];
    
    // Track visited cells
    const visited: boolean[][] = Array(maze.height)
      .fill(0)
      .map(() => Array(maze.width).fill(false));
    
    visited[startY][startX] = true;
    
    // BFS directions: right, down, left, up
    const directions = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: -1 }
    ];
    
    // BFS loop
    while (queue.length > 0) {
      const { x, y, path } = queue.shift()!;
      
      // Check if we reached the end
      if (x === endX && y === endY) {
        return { path, found: true };
      }
      
      // Try all four directions
      for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        // Check if the new position is valid and not visited
        if (
          this.isValidPoint(maze, newX, newY) &&
          !visited[newY][newX]
        ) {
          visited[newY][newX] = true;
          
          // Add to queue with updated path
          const newPath = [...path, { x: newX, y: newY }];
          queue.push({ x: newX, y: newY, path: newPath });
        }
      }
    }
    
    // No path found
    return { path: [], found: false };
  }
  
  /**
   * Check if a point is valid (within bounds and is a path, not a wall)
   */
  private isValidPoint(maze: MazeData, x: number, y: number): boolean {
    return (
      x >= 0 &&
      y >= 0 &&
      x < maze.width &&
      y < maze.height &&
      maze.grid[y][x] // True means path, false means wall
    );
  }
}