A small offline-first to-do list application built with HTML, CSS, and JavaScript.

## Current Status

Ready for local use and installation as a Progressive Web App.

## Project Objective

The project supports English and Arabic, light and dark themes, local task persistence, sound effects, and offline use after the first successful load.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Service Worker
- Web App Manifest

## Run Locally

Serve the project from `localhost` or another secure origin. Opening `index.html` directly is not enough because modules, locale files, and Service Worker registration require a server.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/`, load the app once while online, then install it from the browser. The Service Worker caches the application shell, translations, fonts, images, icons, and sounds for offline use.

<img width="1920" height="1080" alt="Listly" src="https://github.com/user-attachments/assets/0dbed768-44d3-4c97-b20c-d98ae17a0964" />
<img width="1080" height="1920" alt="Listly Mobile" src="https://github.com/user-attachments/assets/7abe9342-ff2b-4000-95ee-82513d78b8f3" />
