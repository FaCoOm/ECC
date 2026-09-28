@echo off
rem install.bat — Windows Command Prompt wrapper for the ECC Kiro installer.
rem Bypasses PowerShell execution policies to run the native installer.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
