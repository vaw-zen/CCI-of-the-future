# GitHub Copilot Project Structure Guidelines

## 🧭 General Rule
Copilot must **never add or modify files in the project root directory**.  
All code, scripts, and automation must be placed **inside the `/scripts` folder**.

---

## 📁 Folder Structure Rules

- `/scripts/` → main workspace for all generated code and utilities.
- `/scripts/<context>/` → a new folder created for each context, task, or subject.
  - Example: `/scripts/seo-tools/`, `/scripts/threejs-scenes/`, `/scripts/firebase-config/`
- Each context folder must contain its own files (no shared files across contexts unless specified).

---

## 🧱 File Naming
- Filenames should be **lowercase**, use **hyphens**, and be **descriptive**.
  - Example: `generate-backlinks.js`, `rank-checker.js`, `optimize-keywords.js`

---

## 🧩 Code Placement Rules
1. Never create files directly in `/`.
2. Always check if a folder for the current context already exists inside `/scripts/`.
3. If not, create a new folder named after the context.
4. All new scripts, configs, or assets must go inside that folder.

---

## 🧠 Examples

✅ **Correct:**
