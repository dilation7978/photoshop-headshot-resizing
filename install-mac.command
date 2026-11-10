#!/bin/bash
# Installs the Headshot scripts into every Photoshop found in /Applications.
# Double-click in Finder (or run in Terminal). Asks for your Mac password
# because /Applications is admin-protected. Restart Photoshop afterward.

cd "$(dirname "$0")" || exit 1

SCRIPTS=("headshot-expand_prep-for-GenFill.jsx" "headshot-save-png.jsx")

for s in "${SCRIPTS[@]}"; do
  if [ ! -f "$s" ]; then
    echo "Missing $s - keep this installer in the same folder as the .jsx files."
    read -r -p "Press Return to close." _
    exit 1
  fi
done

found=0
for dest in /Applications/Adobe\ Photoshop*/Presets/Scripts; do
  [ -d "$dest" ] || continue
  found=1
  echo "Installing into: $dest"
  # install -m 644 makes the files readable by everyone, so Photoshop
  # (running as the logged-in user) can load them regardless of the
  # permissions the source files happened to have.
  sudo install -m 644 "${SCRIPTS[@]}" "$dest/" && echo "  done"
done

if [ "$found" -eq 0 ]; then
  echo "No Photoshop installation found in /Applications."
  echo "Copy the two .jsx files into <Photoshop folder>/Presets/Scripts by hand."
else
  echo
  echo "Installed. Restart Photoshop, then load 'Headshots.atn' from the Actions panel menu (Load Actions...)."
fi
read -r -p "Press Return to close." _
