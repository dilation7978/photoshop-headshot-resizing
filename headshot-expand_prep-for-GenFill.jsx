/*
<javascriptresource>
  <name>Headshot 1 - Expand (prep for GenFill)</name>
  <category>Headshots</category>
  <eventid>277cb9ae-1ee1-4192-b028-35247f7983bf</eventid>
</javascriptresource>
*/

/*
    headshot-expand_prep-for-GenFill.jsx

    PORTABILITY: the <javascriptresource> block above gives this script a
    fixed event ID. When it's installed in Photoshop's Presets/Scripts
    folder and recorded into an Action via File > Scripts > Headshot 1 -
    Expand..., the Action stores that ID instead of a file path, so the
    Action works on any machine that has the script installed. Do not
    change the eventid, or existing Actions will stop finding the script.

    Runs against the ALREADY-OPEN, ACTIVE document in Photoshop (it does
    not open or select a file itself) - meant to be dropped into a
    Photoshop Action as an "Insert Menu Item" / "Run Script" step, so the
    rest of the Action can open the file and run Generative Fill on the
    same document afterward:
      1. Adaptively expands the canvas downward (anchored top-center) using
         Select Subject to gauge how tightly the photo is cropped, then
         squares it up. See "ADAPTIVE EXPANSION" below.
      2. Selects the transparent area just added, expanded by 25px into the
         subject's edge pixels, so the next Action step (Generative Fill)
         has an active selection with some overlap to blend into.
      3. Leaves the document open in Photoshop (not closed, not flattened,
         not saved) so the rest of the Action (or you, by hand) can keep
         going.

    NO BACKGROUND REMOVAL IN THIS SCRIPT
      The background is left as-is - this script only extends the canvas.
      Background removal / Generative Fill are left to the surrounding
      Action, since those run fine as native Action steps even though an
      earlier version of this script found that running ExtendScript and
      Generative Fill in the same session could leave Photoshop reporting
      "Generative Fill service not available" until a restart.

    HOW TO RUN
      Open the headshot JPG in Photoshop first (by hand, or via an earlier
      step in the Action), make sure it's the active document, then run
      this script - either directly via File > Scripts > Browse..., or as
      a step inside a recorded Action. Nothing is saved to disk; the
      document is left open with the expanded transparent area selected.

    ADAPTIVE EXPANSION
      There's no face/landmark detection API exposed to ExtendScript, so
      this uses a proxy: it runs Select Subject to get a bounding box of
      the visible person, then measures how tall that box is (top of head
      to bottom of whatever's currently visible - chin, neck, or shoulders)
      relative to the photo's width. A tight face-only crop produces a
      short, squarish box, so the gap to the target proportion is large and
      it adds a lot of canvas. A generous crop that already shows shoulders
      produces a tall box close to the target already, so little or no
      canvas gets added. Tune TARGET_SUBJECT_RATIO below to change what
      "enough room for shoulders" means.
*/

#target photoshop

// ---- CONFIG ----
var TARGET_SUBJECT_RATIO = 1.7;
var MIN_EXPAND_RATIO = 0.05;
var MAX_EXPAND_RATIO = 0.9;
var FALLBACK_EXPAND_RATIO = 0.35; // used only if Select Subject fails

function main() {
    if (app.documents.length === 0) {
        alert("No document is open. Open the headshot JPG first, then run this again.");
        return;
    }

    var doc = app.activeDocument;
    var file;
    try {
        file = doc.fullName; // throws if the document was never saved to disk
    } catch (e) {
        alert("The active document isn't saved to disk.");
        return;
    }

    var startRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    var startDialogMode = app.displayDialogs;
    app.displayDialogs = DialogModes.ERROR;

    try {
        processDoc(doc);
    } catch (e) {
        alert("Error on " + file.name + ":\n" + e.message);
    }

    app.preferences.rulerUnits = startRulerUnits;
    app.displayDialogs = startDialogMode;
}

function processDoc(doc) {
    // Flatten, then convert to a normal (non-background) layer so the
    // canvas expansion below adds transparent pixels instead of being
    // filled with the background color.
    if (doc.layers.length > 1) doc.flatten();
    doc.activeLayer.isBackgroundLayer = false;
    doc.activeLayer.name = "Subject";

    var origW = doc.width.as("px");
    var origH = doc.height.as("px");

    var addedHeight = computeAddedHeight(doc, origW, origH);
    var newHeight = origH + addedHeight;
    var side = Math.max(origW, newHeight);

    // Anchor TOPCENTER: existing pixels stay pinned to the top-center of
    // the new canvas, so height is added below (for the torso) and any
    // extra width needed to reach a square is split evenly left/right.
    doc.resizeCanvas(side, side, AnchorPosition.TOPCENTER);

    // Select the transparent area (the canvas just added below/around the
    // subject) and grow that selection by 25px so it eats a bit into the
    // subject's edge pixels too - gives the next Generative Fill step some
    // overlap to blend into. Selections are always clipped to the canvas
    // bounds, so expand() can't select anything beyond the canvas edges.
    selectTransparentArea(doc);
    doc.selection.expand(25);

    // Leave the document open for further hand-editing.
}

// Loads the active layer's opaque pixels as a selection (same as
// Ctrl-clicking the layer thumbnail), then inverts it so the transparent
// area ends up selected instead.
function selectTransparentArea(doc) {
    var idsetd = charIDToTypeID("setd");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
    desc.putReference(idnull, ref);
    var idT = charIDToTypeID("T   ");
    var ref2 = new ActionReference();
    ref2.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Trsp"));
    desc.putReference(idT, ref2);
    executeAction(idsetd, desc, DialogModes.NO);

    doc.selection.invert();
}

// See "ADAPTIVE EXPANSION" above for the rationale.
function computeAddedHeight(doc, origW, origH) {
    var visibleSubjectHeight = null;
    try {
        selectSubject(doc);
        if (doc.selection != null) {
            var b = doc.selection.bounds; // [left, top, right, bottom]
            visibleSubjectHeight = b[3].as("px") - b[1].as("px");
            doc.selection.deselect();
        }
    } catch (e) {
        visibleSubjectHeight = null;
    }

    var addedHeight;
    if (visibleSubjectHeight && visibleSubjectHeight > 0) {
        var desiredSubjectHeight = origW * TARGET_SUBJECT_RATIO;
        addedHeight = Math.max(0, desiredSubjectHeight - visibleSubjectHeight);
    } else {
        addedHeight = origW * FALLBACK_EXPAND_RATIO;
    }

    var minAdd = origW * MIN_EXPAND_RATIO;
    var maxAdd = origW * MAX_EXPAND_RATIO;
    if (addedHeight < minAdd) addedHeight = minAdd;
    if (addedHeight > maxAdd) addedHeight = maxAdd;

    return Math.round(addedHeight);
}

// Best-effort attempt at Select Subject via its internal action ID (not
// part of Adobe's official scripting docs). Throws if unavailable.
function selectSubject(doc) {
    var idautoCutout = stringIDToTypeID("autoCutout");
    var desc = new ActionDescriptor();
    executeAction(idautoCutout, desc, DialogModes.NO);
}

main();
