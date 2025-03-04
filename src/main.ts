// src/main.ts
import "./style.css";
import { setupCamera, captureFrame } from "./ui/camera";
import { AppStatus } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
  const solveBtn = document.getElementById("solve-btn") as HTMLButtonElement;
  const statusText = document.getElementById(
    "status-text"
  ) as HTMLParagraphElement;

  let appStatus: AppStatus = AppStatus.IDLE;

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
        statusText.textContent = "Detecting maze...";
        solveBtn.disabled = true;
        break;
      case AppStatus.SOLVING:
        statusText.textContent = "Solving maze...";
        solveBtn.disabled = true;
        break;
      case AppStatus.SOLUTION_READY:
        statusText.textContent =
          "Solution found! Move the camera to see projection";
        solveBtn.disabled = false;
        break;
      case AppStatus.ERROR:
        statusText.textContent = message || "An error occurred";
        startBtn.disabled = false;
        solveBtn.disabled = true;
        break;
    }
  };

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

  // Set up solve button (we'll implement this later)
  solveBtn.addEventListener("click", () => {
    updateStatus(AppStatus.DETECTING);
    const frame = captureFrame();
    console.log("Captured frame:", frame.width, "x", frame.height);

    // We'll add maze detection and solving here in the next steps
    // For now, just simulate the process
    setTimeout(() => {
      updateStatus(AppStatus.SOLVING);

      setTimeout(() => {
        updateStatus(AppStatus.SOLUTION_READY);
      }, 1000);
    }, 1000);
  });
});
