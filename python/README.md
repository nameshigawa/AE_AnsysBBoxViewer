# Python Video Analysis Script

This directory contains a reference Python script for analyzing video files
and exporting bounding-box data in JSON format compatible with
**AE_AnsysBBoxViewer**.

The script is intended as an example implementation and can be replaced
with any custom analysis pipeline that outputs the same JSON structure.

---

## Features

- Analyze MP4 video files
- Generate per-frame bounding box data
- Output JSON compatible with AE_AnsysBBoxViewer
- Save the JSON file in the same directory as the source video

---

## Requirements

- Python 3.9 or later
- OpenCV (`opencv-python`)
- Other dependencies depending on the analysis method used

## Usage
```bash
pip install opencv-python
python analyze_video.py
