/*
@name        Ansys BBox Viewer
@description Visualize Python analysis bounding boxes in After Effects
@author      nameshigawa
@version     1.0.1
*/

app.beginUndoGroup("AE_AnsysBBoxViewer");

function ensureComp() {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return null;
    }
    return comp;
}

// -------------------------
// Controller
// -------------------------
function ensureController(comp) {
    var ctrl = comp.layer("Controller");
    if (ctrl) return ctrl;

    ctrl = comp.layers.addNull();
    ctrl.name = "Controller";

    var fx = ctrl.property("ADBE Effect Parade");

    // JSON Name
    var jsonFx = fx.addProperty("ADBE Layer Control");
    jsonFx.name = "JSON_Name";

    // Stroke Width
    var sw = fx.addProperty("ADBE Slider Control");
    sw.name = "Stroke_Width";
    sw.property("ADBE Slider Control-0001").setValue(2);

    // Color
    var col = fx.addProperty("ADBE Color Control");
    col.name = "Stroke_Color";
    col.property("ADBE Color Control-0001").setValue([0, 1, 0]);

    return ctrl;
}

// -------------------------
// BBox Shape
// -------------------------
function createBBox(comp, ctrl, name) {

    var layer = comp.layers.addShape();
    layer.name = name;

    var contents = layer.property("ADBE Root Vectors Group");
    var group = contents.addProperty("ADBE Vector Group");
    group.name = "BBox";

    var vectors = group.property("ADBE Vectors Group");

    // Rectangle
    var rect = vectors.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Position").setValue([0, 0]);

    // --- Size ---
    rect.property("ADBE Vector Rect Size").expression =
        'var c = thisComp.layer("Controller");\n' +
        'var f = c.effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
        'var d = footage(f).sourceData;\n' +
        'var frames = d.frames ? d.frames : d;\n' +
        'var fi = Math.min(timeToFrames(time), frames.length-1);\n' +
        'var m = thisLayer.name.match(/\\d+/);\n' +
        'var id = m ? parseInt(m[0],10) : 0;\n' +
        'if (frames[fi] && frames[fi].length > id) {\n' +
        '  var b = frames[fi][id];\n' +
        '  [b.width, b.height];\n' +
        '} else [0,0];\n';

    // Fill OFF
    var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Opacity").setValue(0);

    // Stroke
    var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");

    stroke.property("ADBE Vector Stroke Width").expression =
        'thisComp.layer("Controller")\n' +
        '.effect("Stroke_Width")("ADBE Slider Control-0001");';

    stroke.property("ADBE Vector Stroke Color").expression =
        'thisComp.layer("Controller")\n' +
        '.effect("Stroke_Color")("ADBE Color Control-0001");';

    // --- Position ---
    layer.property("ADBE Transform Group")
        .property("ADBE Position").expression =
        'var c = thisComp.layer("Controller");\n' +
        'var f = c.effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
        'var d = footage(f).sourceData;\n' +
        'var frames = d.frames ? d.frames : d;\n' +
        'var fi = Math.min(timeToFrames(time), frames.length-1);\n' +
        'var m = thisLayer.name.match(/\\d+/);\n' +
        'var id = m ? parseInt(m[0],10) : 0;\n' +
        'if (frames[fi] && frames[fi].length > id) {\n' +
        '  var b = frames[fi][id];\n' +
        '  [b.x + b.width/2, b.y + b.height/2];\n' +
        '} else value;\n';

    // --- Opacity ---
    layer.property("ADBE Transform Group")
        .property("ADBE Opacity").expression =
        'var c = thisComp.layer("Controller");\n' +
        'var f = c.effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
        'var d = footage(f).sourceData;\n' +
        'var frames = d.frames ? d.frames : d;\n' +
        'var fi = Math.min(timeToFrames(time), frames.length-1);\n' +
        'var m = thisLayer.name.match(/\\d+/);\n' +
        'var id = m ? parseInt(m[0],10) : 0;\n' +
        '(frames[fi] && frames[fi].length > id) ? 100 : 0;\n';

    return layer;
}

// -------------------------
// Main
// -------------------------
var comp = ensureComp();
if (comp) {
    var ctrl = ensureController(comp);
    createBBox(comp, ctrl, "BBox_0");
}

app.endUndoGroup();
