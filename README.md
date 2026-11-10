# Headshot resizing (Photoshop)

Extends a tightly cropped headshot downward and squares it up, fills the new area with Generative Fill, removes the background and saves a PNG **next to the original** as `<name>_resized.png`.

Works on Mac and Windows, on any network.

## What's included

| File | What it is |
|---|---|
| `headshot-expand_prep-for-GenFill.jsx` | Expands the canvas based on how tightly the photo is cropped, then selects the new area for Generative Fill |
| `headshot-save-png.jsx` | Saves `<original name>_resized.png` in the original file's folder |
| `Headshots.atn` | The Photoshop Action that runs everything in order |
| `install-mac.command` / `install-windows.bat` | Copies the scripts into Photoshop |

## Install (once per computer)

Unzip the folder anywhere first, for example into your Documents folder. Then pick **one** of the options below.

Options A and B both need admin rights on your computer, because Photoshop's Scripts folder is protected. If you don't have admin rights, use option C, or ask IT to do option B for you.

### Option A: Run the installer

- **Mac:** double-click `install-mac.command` and enter your Mac password when asked. If macOS blocks it, right-click it and choose **Open**.
- **Windows:** double-click `install-windows.bat` and click **Yes** when Windows asks for administrator permission.

Then go to **[Load the action](#load-the-action)**.

### Option B: Copy the files by hand

1. **Quit Photoshop.**
2. Open Photoshop's Scripts folder. Replace `2026` with your Photoshop version, which you can see under **Help > About Photoshop** (Windows) or **Photoshop > About Photoshop** (Mac).
   - **Windows:** in File Explorer, paste this into the address bar and press Enter:
     `C:\Program Files\Adobe\Adobe Photoshop 2026\Presets\Scripts`
   - **Mac:** in Finder, press **Cmd+Shift+G**, paste this and press Return:
     `/Applications/Adobe Photoshop 2026/Presets/Scripts`
3. Drag both files into that folder:
   - `headshot-expand_prep-for-GenFill.jsx`
   - `headshot-save-png.jsx`

   When asked for permission, click **Continue** (Windows) or **Authenticate** and enter your password (Mac).
4. **Mac only:** select both files in the Scripts folder and press **Cmd+I**. Under **Sharing & Permissions**, make sure **everyone** is set to **Read only**. If it says "No Access", click the lock, enter your password and change it.
5. Start Photoshop. **File > Scripts** should now list **Headshot 1 - Expand (prep for GenFill)** and **Headshot 2 - Save PNG next to original**.

Then go to **[Load the action](#load-the-action)**.

### Option C: No admin rights

The scripts can stay in any folder you own, but you'll need to point the action at them once.

1. Put both `.jsx` files somewhere permanent, for example `Documents/Headshot Scripts`. If you move them later, you'll have to redo this.
2. Do **[Load the action](#load-the-action)** below.
3. In the Actions panel, expand **Headshot resizing** and delete the first step, the one that runs the Headshot 1 script.
4. Select the action name **Headshot resizing** and click the ● (record) button. Choose **File > Scripts > Browse…**, pick `headshot-expand_prep-for-GenFill.jsx` and click **Load**. Photoshop runs the script once, so have any photo open. Click ■ (stop).
5. Drag the new step to the top of the action if it isn't already there.
6. Delete the step that runs the Headshot 2 script. Select the **Remove Background** step, record, choose **File > Scripts > Browse…**, pick `headshot-save-png.jsx`, and stop recording. Photoshop runs the script once, so it will save a `_resized.png` next to the open photo. Delete that file afterward.

### Load the action

1. In Photoshop, open **Window > Actions**.
2. Click the panel menu (☰, top right of the panel) and choose **Load Actions…**.
3. Pick `Headshots.atn`.
4. A folder called **Headshots** appears, with **Headshot resizing** inside.

## Use

1. Open a headshot (JPG, etc.) in Photoshop.
2. In the Actions panel, open the **Headshots** folder, select **Headshot resizing** and click ▶ Play.
3. When the action pauses, pick one of the three Generative Fill variations, then click ▶ Play again to finish.
4. The result is saved as `<name>_resized.png` beside the original.

## Updating Photoshop

A new major version of Photoshop installs to a new folder. Run the installer again afterward.

## For maintainers

The action calls the scripts by a fixed **event ID** (in the `<javascriptresource>` block at the top of each `.jsx`), not by a file path. That's what makes it portable.

- Don't change the `<eventid>` values, or the action will stop finding the scripts.
- When re-recording action steps, always add the scripts via **File > Scripts > Headshot …**, never via **File > Scripts > Browse…**, which records a hard-coded path again.
