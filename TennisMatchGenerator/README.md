# Tennis Match Generator

Eine Desktop-Anwendung zur Verwaltung und Generierung von Tennis-Spielpaarungen, Spieltagen, Statistiken und Ranglisten.

## Tech-Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** MUI (Material UI) 7, Chakra UI 3
- **Backend/Desktop:** Tauri 2 (Rust)
- **Datenbank:** SQLite (via tauri-plugin-sql)
- **Paketmanager:** pnpm

## Voraussetzungen

Folgende Tools müssen installiert sein:

- [Node.js](https://nodejs.org/) (>= 18)
- [pnpm](https://pnpm.io/) (>= 8)
- [Rust](https://www.rust-lang.org/tools/install) (aktuelle stable Version)
- Tauri-Systemabhängigkeiten (siehe [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Linux (Debian/Ubuntu)

```bash
# Systemabhängigkeiten für Tauri
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
sudo npm install -g pnpm

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Windows

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (ab Windows 10 bereits vorhanden)
- [Node.js](https://nodejs.org/) herunterladen und installieren
- pnpm: `npm install -g pnpm`
- [Rust](https://www.rust-lang.org/tools/install) herunterladen und installieren

### macOS

```bash
xcode-select --install

# Node.js (via Homebrew)
brew install node

# pnpm
sudo npm install -g pnpm

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

## Installation

```bash
# Repository klonen
git clone <repository-url>
cd TennisMatchGenerator

# Abhängigkeiten installieren
pnpm install
```

## Entwicklung

```bash
# Tauri-App im Entwicklungsmodus starten (Frontend + Backend)
pnpm tauri dev
```

Die App startet mit Hot-Reload auf `http://localhost:1420`.

## Build (Produktiv)

```bash
# Produktions-Build erstellen
pnpm tauri build
```

Die fertigen Installer/Binaries befinden sich anschließend unter:

```
src-tauri/target/release/bundle/
```

| Plattform | Ausgabeformat |
|-----------|---------------|
| Linux     | `.deb`, `.AppImage` |
| Windows   | `.msi`, `.exe` (NSIS) |
| macOS     | `.dmg`, `.app` |

## Projektstruktur

```
├── src/                  # React-Frontend (TypeScript)
│   ├── components/       # UI-Komponenten
│   ├── pages/            # Seiten/Views
│   ├── services/         # Business-Logik
│   ├── model/            # Datenmodelle
│   ├── db/               # Datenbank-Zugriff
│   └── context/          # React Context Provider
├── src-tauri/            # Tauri/Rust-Backend
│   └── src/              # Rust-Quellcode
├── public/               # Statische Assets
└── export_template/      # Export-Vorlagen
```

## Empfohlene IDE

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
