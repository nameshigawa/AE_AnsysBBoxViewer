# AE_AnsysBBoxViewer

AE_AnsysBBoxViewer is an After Effects tool for visualizing bounding-box data
generated from Python-based video analysis workflows.

It allows you to overlay frame-accurate bounding boxes in After Effects
using JSON data exported from object detection or computer vision pipelines.

## Features
- Load JSON bounding-box data
- Visualize multiple bounding boxes per frame
- Controller layer for unified control
- Language-independent expressions (matchName based)
- Designed for object detection and computer vision workflows

## Requirements
- macOS or Windows
- After Effects 2020 or later
- JSON file imported as footage

## Usage

1. Launch After Effects and open a project.
2. Import an MP4 video file and the corresponding JSON file.
3. Create a composition based on the MP4 video.*
4. Create new shape layers with a Rectangle Path and select them.
5. Run `AE_AnsysBBoxViewer.jsx`.
6. A Controller layer will be created automatically.
7. Assign the JSON file in the Controller layer.
8. Bounding boxes will be displayed and updated per frame.**

\* The composition size, frame rate, and duration must match the source MP4.

\** To display multiple bounding boxes, duplicate the shape layers and include
zero-based numeric IDs in the layer names (e.g. Box_0, Box_1).

## JSON Format

The JSON file must be an array of frames.
Each frame is an array of bounding-box objects.

```json
[
  [
    {
      "id": 0,
      "x": 398,
      "y": 611,
      "width": 62,
      "height": 108,
      "label": "person",
      "conf": 0.52
    },
    {
      "id": 1,
      "x": 350,
      "y": 643,
      "width": 68,
      "height": 77,
      "label": "person",
      "conf": 0.479
    }
  ]
]
```

- The top-level array represents frames in time order.
- Bounding boxes are indexed per frame starting from 0.
- Shape layer names must include a zero-based numeric ID
  that matches the `id` field (e.g. Box_0, Box_1).
- If no bounding box exists for a given ID in a frame,
  the corresponding shape layer will be hidden automatically.
- Additional fields such as tracking IDs or custom metadata
  can be included and will be ignored by the viewer if not used.

### Bounding Box Fields

- `id`     : Zero-based bounding-box identifier
- `x`, `y` : Top-left position of the bounding box
- `width`  : Width of the bounding box
- `height` : Height of the bounding box
- `label`  : Class label (e.g. "person")
- `conf`   : Detection confidence (0.0 – 1.0)

## Roadmap

- v1.1.0: Advanced bounding-box control
  - Automatic shape layer duplication by ID
  - Label-based color coding
  - Confidence threshold and visibility control

- v2.0.0: Annotation overlay
  - Label and confidence text display
  - Text layers following bounding boxes
  - UI-style visualization
