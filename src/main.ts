// src/main.ts
import "./style.css";
import { setupCamera, captureFrame } from "./ui/camera";
import { MazeDetector } from "./maze/detector";
import { MazeSolver } from "./maze/solver";
import { OverlayRenderer } from "./ui/overlay";
import { AppStatus, MazeData, MazeSolution, Point } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
  const solveBtn = document.getElementById("solve-btn") as HTMLButtonElement;
  const statusText = document.getElementById(
    "status-text"
  ) as HTMLParagraphElement;
  const overlayElement = document.getElementById(
    "overlay"
  ) as HTMLCanvasElement;

  let appStatus: AppStatus = AppStatus.IDLE;
  let currentMaze: MazeData | null = null;
  let currentSolution: MazeSolution | null = null;

  const mazeDetector = new MazeDetector();
  const mazeSolver = new MazeSolver();
  const overlayRenderer = new OverlayRenderer();

  const updateStatus = (status: AppStatus, message?: string): void => {
    appStatus = status;

    switch (status) {
      case AppStatus.IDLE:
        statusText.textContent = "Ready to start";
        startBtn.disabled = false;
        solveBtn.disabled = true;
        break;
      case AppStatus.CAMERA_READY:
        statusText.textContent =
          "Camera ready! Point at a maze and press Solve";
        startBtn.disabled = true;
        solveBtn.disabled = false;
        break;
      case AppStatus.DETECTING:
        statusText.textContent = "Processing maze...";
        solveBtn.disabled = true;
        break;
      case AppStatus.SELECTING_START:
        statusText.textContent = "Tap on the screen to set START point";
        solveBtn.disabled = true;
        overlayRenderer.drawSelectionHint("Tap to set START point");
        break;
      case AppStatus.SELECTING_END:
        statusText.textContent = "Tap on the screen to set END point";
        solveBtn.disabled = true;
        overlayRenderer.drawSelectionHint("Tap to set END point");
        break;
      case AppStatus.SOLVING:
        statusText.textContent = "Solving maze...";
        solveBtn.disabled = true;
        break;
      case AppStatus.SOLUTION_READY:
        statusText.textContent = "Solution found!";
        solveBtn.disabled = false;
        break;
      case AppStatus.ERROR:
        statusText.textContent = message || "An error occurred";
        startBtn.disabled = false;
        solveBtn.disabled = true;
        break;
    }
  };

  // Handle canvas clicks for point selection
  overlayElement.addEventListener("click", (event) => {
    if (!currentMaze) return;

    // Get click coordinates relative to the canvas
    const rect = overlayElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates if canvas display size differs from its internal size
    const scaleX = overlayElement.width / rect.width;
    const scaleY = overlayElement.height / rect.height;

    const point: Point = {
      x: x * scaleX,
      y: y * scaleY,
    };

    if (appStatus === AppStatus.SELECTING_START) {
      currentMaze.start = point;
      overlayRenderer.drawMaze(currentMaze);
      updateStatus(AppStatus.SELECTING_END);
    } else if (appStatus === AppStatus.SELECTING_END) {
      currentMaze.end = point;
      overlayRenderer.drawMaze(currentMaze);

      // Solve the maze
      updateStatus(AppStatus.SOLVING);

      setTimeout(() => {
        if (currentMaze) {
          currentSolution = mazeSolver.solveMaze(currentMaze);

          if (currentSolution.found) {
            overlayRenderer.drawSolution(currentSolution);
            updateStatus(AppStatus.SOLUTION_READY);
          } else {
            updateStatus(
              AppStatus.ERROR,
              "No solution found. Try different points."
            );
          }
        }
      }, 500);
    }
  });

  // Set up camera button click
  startBtn.addEventListener("click", async () => {
    try {
      updateStatus(AppStatus.DETECTING, "Starting camera...");
      await setupCamera();
      updateStatus(AppStatus.CAMERA_READY);
    } catch (error) {
      if (error instanceof Error) {
        updateStatus(AppStatus.ERROR, `Error: ${error.message}`);
      } else {
        updateStatus(AppStatus.ERROR, "An unknown error occurred");
      }
      console.error("Camera setup error:", error);
    }
  });

  // Set up solve button
  solveBtn.addEventListener("click", () => {
    updateStatus(AppStatus.DETECTING);

    // Clear previous maze
    overlayRenderer.clear();
    currentMaze = null;
    currentSolution = null;

    // Capture frame from camera
    const frame = captureFrame();

    // Process the frame to detect maze
    setTimeout(() => {
      try {
        currentMaze = mazeDetector.detectMaze(frame);

        // Draw the maze
        overlayRenderer.drawMaze(currentMaze);

        // Let user select start point
        updateStatus(AppStatus.SELECTING_START);
      } catch (error) {
        console.error("Error processing maze:", error);
        updateStatus(
          AppStatus.ERROR,
          "Error processing image. Please try again."
        );
      }
    }, 1000);
  });
});
