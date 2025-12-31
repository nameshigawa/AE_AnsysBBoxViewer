# Python Video Analysis Script

This directory contains a reference Python script for analyzing video files
and exporting bounding-box data in JSON format compatible with

**AE_AnsysBBoxViewer**.

The script is intended as an example implementation and can be replaced
with any custom analysis pipeline that outputs the same JSON structure.

**Current Version:** v1.0.1 (JSON-driven)

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
```

## Google Colab

You can run the Python video analysis script directly in Google Colab:

[Open in Google Colab](https://colab.research.google.com/github/nameshigawa/AE_AnsysBBoxViewer/blob/main/python/ansys_video_colab.ipynb)

## Legacy Version

`ae/legacy/AE_AnsysBBoxViewer_v1.0.0.jsx` is provided as a minimal, non-JSON example for reference and learning purposes.
