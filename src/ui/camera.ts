// src/ui/camera.ts
import { VideoFrame } from "../types";

let videoStream: MediaStream | null = null;

export async function setupCamera(): Promise<void> {
  const video = document.getElementById("video") as HTMLVideoElement;
  const overlay = document.getElementById("overlay") as HTMLCanvasElement;

  // Get camera access
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment", // Use back camera on mobile
      },
    };

    videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = videoStream;

    // Wait for video to be ready
    return new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        // Set canvas to match video dimensions
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
        resolve();
      };
    });
  } catch (error) {
    throw new Error("Camera access denied or not available");
  }
}

export function stopCamera(): void {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
}

export function captureFrame(): VideoFrame {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return {
    imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
    width: canvas.width,
    height: canvas.height,
  };
}
