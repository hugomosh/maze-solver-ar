// src/types/index.ts

// Point coordinate in the image
export interface Point {
    x: number;
    y: number;
  }
  
  // Cell in the maze
  export interface MazeCell {
    row: number;
    col: number;
    walls: {
      top: boolean;
      right: boolean;
      bottom: boolean;
      left: boolean;
    };
    visited?: boolean;
  }
  
  // The complete maze structure
  export interface Maze {
    cells: MazeCell[][];
    entrance?: MazeCell;
    exit?: MazeCell;
    width: number;
    height: number;
  }
  
  // Frame captured from the video
  export interface VideoFrame {
    imageData: ImageData;
    width: number;
    height: number;
  }
  
  // Solution path through the maze
  export interface MazeSolution {
    path: MazeCell[];
    found: boolean;
  }
  
  // Status of the application
  export enum AppStatus {
    IDLE = 'idle',
    CAMERA_READY = 'camera_ready',
    DETECTING = 'detecting',
    SOLVING = 'solving',
    SOLUTION_READY = 'solution_ready',
    ERROR = 'error'
  }