// src/types/index.ts
export interface Point {
  x: number;
  y: number;
}

export interface VideoFrame {
  imageData: ImageData;
  width: number;
  height: number;
}

// Representing the maze as a binary grid where true = navigable path, false = wall
export interface MazeData {
  grid: boolean[][];
  width: number;
  height: number;
  start?: Point;
  end?: Point;
}

export interface MazeSolution {
  path: Point[];
  found: boolean;
}

export enum AppStatus {
  IDLE = "idle",
  CAMERA_READY = "camera_ready",
  DETECTING = "detecting",
  SELECTING_START = "selecting_start",
  SELECTING_END = "selecting_end",
  SOLVING = "solving",
  SOLUTION_READY = "solution_ready",
  ERROR = "error",
}
