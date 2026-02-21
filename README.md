

<p align="center">
  <img src="extension/icon128.png" width="72" alt="TerminalStart Icon">
</p>

<h1 align="center">TerminalStart</h1>

<p align="center">
  Retro-inspired, modular new tab dashboard built for focus and speed.
</p>

<p align="center">
  <img src="docs/mainPage.png" width="900" alt="TerminalStart Preview">
</p>

<p align="center">
  <img src="docs/settingsPage.png" width="900" alt="TerminalStart Settings">
</p>

---


## Install in Edge / Chrome

1. Open `edge://extensions` (or `chrome://extensions`)
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension` folder


## Build

### Requirements

* Node.js v16+
* Python 3

### Steps

1. Install dependencies:

```
npm install
```

2. Build:

```
npm run build
```

3. Copy built assets into the extension:

`/dist/assets` → `/extension/assets`

4. Package:

```
python scripts/package_addon.py
```

Output: `terminal-start-v1.0.0.zip`

## Notes


- Hover over the top right section for settings.

