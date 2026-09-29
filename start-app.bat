@echo off
title AZ JEWELERS Dev Server
cd /d "%~dp0"
echo ==================================================
echo   Starting AZ JEWELERS Server...
echo ==================================================
npm.cmd run dev -- --host
pause
