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
import yaml
import tkinter as tk
from tkinter import filedialog
from ultralytics import YOLO


# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

DEFAULT_CONFIG = {
    'tracker_type': 'bytetrack',
    'track_high_thresh': 0.6,
    'track_low_thresh': 0.1,
    'new_track_thresh': 0.7,
    'track_buffer': 60,
    'match_thresh': 0.85,
    'fuse_score': True,
    'motion': {'max_iou_distance': 0.7}
}


def load_config(config_path):
    """Load configuration from YAML file"""
    try:
        if not os.path.exists(config_path):
            print(f"Config file not found at: {config_path}")
            return None
        
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        if config is None:
            print(f"Invalid YAML file (empty or malformed): {config_path}")
            return None
        
        return config
    except Exception as e:
        print(f"Error loading config: {e}")
        return None


# Default configuration path (relative to this script)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, '..', 'custom_bytetrack.yaml')

# Load configuration with fallback to defaults
print(f"Loading configuration from: {CONFIG_PATH}")
CONFIG = load_config(CONFIG_PATH)
if CONFIG is None:
    print("Using default configuration")
    CONFIG = DEFAULT_CONFIG
else:
    print("✓ Configuration loaded successfully")

MODEL_NAME = "yolo11m"  # Changed from .pt to auto-download
SHOW_PREVIEW = True   # Set False to disable OpenCV preview window


# ------------------------------------------------------------
# Model Download
# ------------------------------------------------------------

def ensure_model_available():
    """Ensure YOLO model is downloaded"""
    try:
        print(f"Loading YOLO model: {MODEL_NAME}")
        model = YOLO(MODEL_NAME)
        print("✓ Model loaded successfully")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Attempting to download model...")
        return YOLO(MODEL_NAME)


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
    model = ensure_model_available()
    
    # Initialize tracker with configuration
    tracker_config = {
        'tracker_type': CONFIG.get('tracker_type', 'bytetrack'),
        'track_high_thresh': CONFIG.get('track_high_thresh', 0.6),
        'track_low_thresh': CONFIG.get('track_low_thresh', 0.1),
        'new_track_thresh': CONFIG.get('new_track_thresh', 0.7),
        'track_buffer': CONFIG.get('track_buffer', 60),
        'match_thresh': CONFIG.get('match_thresh', 0.85),
        'fuse_score': CONFIG.get('fuse_score', True),
    }
    
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

    print("=" * 60)
    print("CONFIGURATION LOADED:")
    print("=" * 60)
    for key, value in CONFIG.items():
        if isinstance(value, dict):
            print(f"{key}:")
            for k, v in value.items():
                print(f"  {k}: {v}")
        else:
            print(f"{key}: {value}")
    print("=" * 60)
    
    print("\nAnalyzing:", video_path)
    data = analyze_video(video_path)
    json_path = export_json(video_path, data)

    print("Analysis Complete")
    print("JSON:", json_path)


if __name__ == "__main__":
    main()
