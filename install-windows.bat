@echo off
setlocal enabledelayedexpansion
rem Installs the Headshot scripts into every Photoshop under Program Files.
rem Double-click to run. It will ask for administrator permission because
rem Program Files is protected. Restart Photoshop afterward.

net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

for %%S in ("headshot-expand_prep-for-GenFill.jsx" "headshot-save-png.jsx") do (
    if not exist %%S (
        echo Missing %%~S - keep this installer in the same folder as the .jsx files.
        pause
        exit /b 1
    )
)

set found=0
for /d %%P in ("%ProgramFiles%\Adobe\Adobe Photoshop*") do (
    if exist "%%P\Presets\Scripts" (
        set found=1
        echo Installing into: %%P\Presets\Scripts
        copy /y "headshot-expand_prep-for-GenFill.jsx" "%%P\Presets\Scripts\" >nul
        copy /y "headshot-save-png.jsx" "%%P\Presets\Scripts\" >nul
        echo   done
    )
)

if "!found!"=="0" (
    echo No Photoshop installation found in "%ProgramFiles%\Adobe".
    echo Copy the two .jsx files into ^<Photoshop folder^>\Presets\Scripts by hand.
) else (
    echo.
    echo Installed. Restart Photoshop, then load "Headshots.atn" from the Actions panel menu ^(Load Actions...^).
)
pause
