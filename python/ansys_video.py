"""
AE_AnsysBBoxViewer - Video Analysis Script

This script analyzes an MP4 video file and exports per-frame
bounding-box data in JSON format compatible with AE_AnsysBBoxViewer.

- Select an MP4 file via file dialog
- Run object detection on each frame
- Output JSON file in the same directory as the source video

This script is provided as a reference implementation.
"""

import os
import json
import cv2
import tkinter as tk
from tkinter import filedialog
from ultralytics import YOLO


# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

MODEL_NAME = "yolov8n.pt"
SHOW_PREVIEW = True   # Set False to disable OpenCV preview window


# ------------------------------------------------------------
# File Selection
# ------------------------------------------------------------

def select_video():
    root = tk.Tk()
    root.withdraw()
    return filedialog.askopenfilename(
        title="Select MP4 for Analysis",
        filetypes=[("MP4 files", "*.mp4")]
    )


# ------------------------------------------------------------
# Main Analysis
# ------------------------------------------------------------

def analyze_video(video_path):
    model = YOLO(MODEL_NAME)
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError("Failed to open video file.")

    all_frames = []
    frame_index = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)
        boxes = results[0].boxes

        frame_boxes = []

        if boxes is not None:
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                frame_boxes.append({
                    "id": i,
                    "x": int(x1),
                    "y": int(y1),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                    "label": results[0].names[int(box.cls[0])],
                    "conf": float(box.conf[0])
                })

                if SHOW_PREVIEW:
                    cv2.rectangle(
                        frame,
                        (int(x1), int(y1)),
                        (int(x2), int(y2)),
                        (0, 255, 0),
                        2
                    )

        all_frames.append(frame_boxes)

        if SHOW_PREVIEW:
            cv2.imshow("analysis", frame)
            if cv2.waitKey(1) & 0xFF == 27:
                break

        frame_index += 1

    cap.release()
    cv2.destroyAllWindows()

    return all_frames


# ------------------------------------------------------------
# JSON Export
# ------------------------------------------------------------

def export_json(video_path, data):
    base, _ = os.path.splitext(video_path)
    json_path = base + "_boxes.json"

    with open(json_path, "w") as f:
        json.dump(data, f, indent=2)

    return json_path


# ------------------------------------------------------------
# Entry Point
# ------------------------------------------------------------

def main():
    video_path = select_video()

    if not video_path:
        print("No MP4 file selected.")
        return

    print("Analyzing:", video_path)
    data = analyze_video(video_path)
    json_path = export_json(video_path, data)

    print("Analysis Complete")
    print("JSON:", json_path)


if __name__ == "__main__":
    main()
