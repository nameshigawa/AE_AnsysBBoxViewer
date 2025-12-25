/*
@name        Ansys BBox Viewer
@description Visualize Python analysis bounding boxes in After Effects
@author      nameshigawa
@version     1.0.0
*/

(function () {
    app.beginUndoGroup("Ansys BBox Viewer");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition");
        return;
    }

    /* =========================
       ① 選択レイヤーを保存
    ========================= */
    var targets = comp.selectedLayers.slice();

    if (targets.length === 0) {
        alert("Please select a shape layer");
        return;
    }

    /* =========================
       ② Controller レイヤー取得 or 作成
    ========================= */
    var ctrl = null;
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === "Controller") {
            ctrl = comp.layer(i);
            break;
        }
    }

    if (!ctrl) {
        ctrl = comp.layers.addNull();
        ctrl.name = "Controller";
        ctrl.label = 9;
    }

    /* =========================
       ③ Controller エフェクト作成
    ========================= */
    function ensureEffect(layer, matchName, name, initValue) {
        var fx = layer.property("Effects");
        var e = null;

        for (var i = 1; i <= fx.numProperties; i++) {
            if (fx.property(i).matchName === matchName) {
                e = fx.property(i);
                break;
            }
        }

        if (!e) {
            e = fx.addProperty(matchName);
            e.name = name;
        }

        if (initValue !== undefined) {
            try { e.property(1).setValue(initValue); } catch (_) {}
        }
        return e;
    }

    ensureEffect(ctrl, "ADBE Layer Control", "JSON_Name");
    ensureEffect(ctrl, "ADBE Checkbox Control", "Visible", 1);
    ensureEffect(ctrl, "ADBE Slider Control", "Stroke_Width", 2);
    ensureEffect(ctrl, "ADBE Color Control", "Stroke_Color", [0, 1, 0]);

    /* =========================
       ④ 選択レイヤーに適用
    ========================= */
    function findByMatchName(group, matchName) {
        for (var i = 1; i <= group.numProperties; i++) {
            if (group.property(i).matchName === matchName) {
                return group.property(i);
            }
        }
        return null;
    }

    for (var i = 0; i < targets.length; i++) {
        var layer = targets[i];
        if (!(layer instanceof ShapeLayer)) continue;

        var contents = layer.property("Contents");
        if (!contents || contents.numProperties === 0) continue;

        var group = contents.property(1);
        var groupContents = group.property("Contents");

        // Rectangle Size
        var rect = findByMatchName(groupContents, "ADBE Vector Shape - Rect");
        if (rect && rect.property("Size").canSetExpression) {
            rect.property("Size").expression =
'var jsonName = thisComp.layer("Controller").effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
'var data = footage(jsonName).sourceData;\n' +
'var frames = data.frames ? data.frames : data;\n' +
'var f = Math.min(timeToFrames(time), frames.length - 1);\n' +
'var m = thisLayer.name.match(/\\d+/);\n' +
'var id = m ? parseInt(m[0], 10) : 0;\n' +
'frames[f] && frames[f][id]\n' +
' ? [frames[f][id].width, frames[f][id].height]\n' +
' : [0,0];';
        }

        // Stroke
        var stroke = findByMatchName(groupContents, "ADBE Vector Graphic - Stroke");
        if (stroke) {
            stroke.property("Stroke Width").expression =
'thisComp.layer("Controller").effect("Stroke_Width")("ADBE Slider Control-0001");';

            stroke.property("Color").expression =
'thisComp.layer("Controller").effect("Stroke_Color")("ADBE Color Control-0001");';
        }

        // Position
        layer.property("Transform").property("Position").expression =
'var jsonName = thisComp.layer("Controller").effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
'var data = footage(jsonName).sourceData;\n' +
'var frames = data.frames ? data.frames : data;\n' +
'var f = Math.min(timeToFrames(time), frames.length - 1);\n' +
'var m = thisLayer.name.match(/\\d+/);\n' +
'var id = m ? parseInt(m[0], 10) : 0;\n' +
'frames[f] && frames[f][id]\n' +
' ? [frames[f][id].x + frames[f][id].width / 2,\n' +
'    frames[f][id].y + frames[f][id].height / 2]\n' +
' : value;';

        // Opacity（id が無ければ 0）
        layer.property("Transform").property("Opacity").expression =
'var jsonName = thisComp.layer("Controller").effect("JSON_Name")("ADBE Layer Control-0001").name;\n' +
'var data = footage(jsonName).sourceData;\n' +
'var frames = data.frames ? data.frames : data;\n' +
'var f = Math.min(timeToFrames(time), frames.length - 1);\n' +
'var m = thisLayer.name.match(/\\d+/);\n' +
'var id = m ? parseInt(m[0], 10) : 0;\n' +
'(thisComp.layer("Controller").effect("Visible")("ADBE Checkbox Control-0001")==1 && frames[f] && frames[f][id]) ? 100 : 0;';
    }

    app.endUndoGroup();
})();
