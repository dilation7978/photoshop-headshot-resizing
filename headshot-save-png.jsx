/*
<javascriptresource>
  <name>Headshot 2 - Save PNG next to original</name>
  <category>Headshots</category>
  <eventid>3cd2a4dd-18d4-459d-9e9e-48f319e8f8bb</eventid>
</javascriptresource>
*/

/*
    headshot-save-png.jsx

    Saves the active document as a PNG in the same folder as the file it
    was opened from, with "_resized" added to the name:

        /path/to/Jane Doe.jpg  ->  /path/to/Jane Doe_resized.png

    Overwrites an existing *_resized.png without asking, so the Action
    can run unattended. The document is left open, now pointing at the
    PNG, so a following "Close" step in the Action won't prompt to save.

    Replaces the old recorded "Save As PNG" Action step, which had a
    hardcoded folder on one person's machine. Uses the same PNG settings
    that step used: moderate compression, no embedded color profile,
    lowercase extension.

    PORTABILITY: like the expand script, this has a fixed event ID (above)
    so an Action can call it by ID rather than by path. Record it from
    File > Scripts > Headshot 2 - Save PNG..., not via Browse...
*/

#target photoshop

var SUFFIX = "_resized";

function main() {
    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var doc = app.activeDocument;
    var folder, name;
    try {
        folder = doc.path;      // throws if the document was never saved
        name = doc.name;
    } catch (e) {
        alert("The active document isn't saved to disk, so there's no original folder to save next to.");
        return;
    }

    // Strip the extension, and don't stack suffixes if run twice.
    var base = name.replace(/\.[^.]+$/, "");
    if (base.length >= SUFFIX.length &&
        base.substr(base.length - SUFFIX.length) === SUFFIX) {
        base = base.substr(0, base.length - SUFFIX.length);
    }

    var outFile = new File(folder.fsName + "/" + base + SUFFIX + ".png");

    try {
        savePNG(outFile);
    } catch (e) {
        alert("Couldn't save " + outFile.fsName + ":\n" + e.message);
    }
}

// Same descriptor Photoshop records for File > Save As > PNG, so the
// output matches the old Action step exactly. Falls back to the DOM API
// if a future Photoshop rejects the descriptor.
function savePNG(file) {
    try {
        var png = new ActionDescriptor();
        png.putEnumerated(charIDToTypeID("Mthd"), stringIDToTypeID("PNGMethod"), stringIDToTypeID("moderate"));
        png.putEnumerated(stringIDToTypeID("embedIccProfileLastState"), stringIDToTypeID("embedOff"), stringIDToTypeID("embedOff"));

        var desc = new ActionDescriptor();
        desc.putObject(charIDToTypeID("As  "), charIDToTypeID("PNGF"), png);
        desc.putPath(charIDToTypeID("In  "), file);
        desc.putBoolean(charIDToTypeID("LwCs"), true);  // lowercase extension
        desc.putBoolean(charIDToTypeID("EmbP"), false); // no embedded profile
        executeAction(charIDToTypeID("save"), desc, DialogModes.NO);
    } catch (e) {
        var opts = new PNGSaveOptions();
        opts.compression = 6;
        opts.interlaced = false;
        app.activeDocument.saveAs(file, opts, false, Extension.LOWERCASE);
    }
}

main();
