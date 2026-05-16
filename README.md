# blockhaus

A small Windows-first Tauri + React desktop app with reminders for common git workflows.

## Workflows

- Starting a new GitHub project and cloning it locally.
- Pushing a local branch, opening a pull request, merging it, and updating local `main`.

## Development

Prerequisites on Windows:

- Node.js 18 or newer.
- Rust through `rustup`.
- Tauri prerequisites from the official setup guide.

If working inside WSL, use a Linux Node.js 18+ install. Windows `npm` cannot reliably install dependencies into a WSL UNC path.

Install dependencies:

```bash
npm install
```

Run the desktop app:

```bash
npm run dev
```

Build the desktop app:

```bash
npm run build
```
