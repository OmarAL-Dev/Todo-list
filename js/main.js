import { sendToLocalStorage, getFromLocalStorage } from "./localstorage.js";
import { setLanguage, translate, tPlural } from "./i18n.js";

// Main elements
const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");
const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");
const clearBtn = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");
const tasksLeftLabel = document.querySelector("#tasks-left-label");
const taskTemplate = document.querySelector("#task-template");

// Settings elements
const settingsDialog = document.querySelector("#settings-dialog");
const settingsForm = document.querySelector("#settings-form");
const settingsBtn = document.querySelector("#settings-btn");

// Sound effects
function createSound(path) {
    const sound = new Audio(path);
    sound.preload = "auto";
    return sound;
}

const taskAddedSound = createSound('assets/sounds/startTask.wav');
const taskDoneSound = createSound('assets/sounds/done.wav');
const errorSound = createSound('assets/sounds/erorr.wav');
const deleteSound = createSound('assets/sounds/delete.mp3');
const clearAllSound = createSound('assets/sounds/clearAll.wav');

/* ==========================================================================
   SETTINGS (theme + language)
   ========================================================================== */
// Keep these keys aligned with the early settings script in index.html.
const KEY_THEME = "theme";
const KEY_LANGUAGE = "language";
const KEY_ONBOARDED = "settings";

function readSetting(key, fallback) {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

function writeSetting(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Continue without persistence when local storage is unavailable.
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

function getSavedSettings() {
    return {
        theme: readSetting(KEY_THEME, "light"),
        language: readSetting(KEY_LANGUAGE, "en"),
        onboarded: readSetting(KEY_ONBOARDED, null) === "1",
    };
}

// Sync radio controls without dispatching change events.
function syncFormWithSaved() {
    const saved = getSavedSettings();
    settingsForm.elements.theme.value = saved.theme;
    settingsForm.elements.language.value = saved.language;
}

function openSettings() {
    syncFormWithSaved();
    settingsDialog.showModal();
}

// Apply the language and refresh the counter label.
async function changeLanguage(language) {
    await setLanguage(language);
    updateTasksLeft();
}

// Preview changes immediately without saving them.
settingsForm.addEventListener("change", (event) => {
    const { name, value } = event.target;

    if (name === "theme") applyTheme(value);
    if (name === "language") changeLanguage(value);
});

// Save settings only when Finish is submitted.
settingsForm.addEventListener("submit", () => {
    const data = new FormData(settingsForm);

    writeSetting(KEY_THEME, data.get("theme"));
    writeSetting(KEY_LANGUAGE, data.get("language"));
    writeSetting(KEY_ONBOARDED, "1");
});

// Prevent closing the first-visit dialog before Finish is submitted.
settingsDialog.addEventListener("cancel", (event) => {
    if (!getSavedSettings().onboarded) event.preventDefault();
});

// Restore saved settings whenever the dialog closes.
settingsDialog.addEventListener("close", () => {
    const saved = getSavedSettings();
    applyTheme(saved.theme);
    changeLanguage(saved.language);
});

settingsBtn.addEventListener("click", openSettings);

/* ==========================================================================
   TODO APP
   ========================================================================== */

// State
let nextTaskId = 0;
let tasksLeft = 0;
let tasks = [];

// Update the count and localized plural label.
function updateTasksLeft() {
    tasksCount.textContent = tasksLeft;

    const label = tPlural("footer.tasksLeft", tasksLeft);
    if (label !== undefined) tasksLeftLabel.textContent = label;
}

// Sound helper
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

// Animations
function animateTaskInsertion(taskElement) {
    taskElement.classList.add("adding");
    todoList.appendChild(taskElement);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            taskElement.classList.remove("adding");
        });
    });
}

function animateTaskRemoval(taskElement) {
    return new Promise((resolve) => {
        taskElement.classList.add("removing");
        taskElement.addEventListener("transitionend", () => {
            taskElement.remove();
            resolve();
        }, { once: true });
    });
}

function checkEmptyState() {
    if (todoList.querySelectorAll(".task").length === 0) {
        emptyState.classList.remove("hidden");
    }
}

// Render Saved Tasks on Application Start
function render() {
    tasks = getFromLocalStorage();

    if (!Array.isArray(tasks) || tasks.length === 0) {
        emptyState.classList.remove("hidden");
        updateTasksLeft();
        return;
    }

    emptyState.classList.add("hidden");
    todoList.innerHTML = "";

    tasks.forEach(task => {
        const clone = taskTemplate.content.cloneNode(true);
        const input = clone.querySelector("input");
        const label = clone.querySelector("label");

        label.textContent = task.text;
        input.id = `task-${task.id}`;
        label.setAttribute("for", `task-${task.id}`);
        input.checked = task.completed;

        translate(clone); // Translate the detached template after cloning it.
        todoList.appendChild(clone);
    });

    tasksLeft = tasks.filter(task => !task.completed).length;
    updateTasksLeft();
    nextTaskId = tasks.reduce((max, task) => task.id > max ? task.id : max, 0);
}

// Add Task Function
function addTask() {
    const taskText = inputAdd.value.trim();

    if (taskText.length === 0) {
        playSound(errorSound);
        inputAdd.classList.add("error");
        setTimeout(() => inputAdd.classList.remove("error"), 500);
        return;
    }

    emptyState.classList.add("hidden");
    nextTaskId++;

    const clone = taskTemplate.content.cloneNode(true);
    const input = clone.querySelector("input");
    const label = clone.querySelector("label");
    const taskElement = clone.querySelector(".task");

    label.textContent = taskText;
    input.id = `task-${nextTaskId}`;
    label.setAttribute("for", `task-${nextTaskId}`);

    translate(clone);
    animateTaskInsertion(taskElement);
    playSound(taskAddedSound);
    inputAdd.value = "";

    tasks.push({
        id: nextTaskId,
        text: taskText,
        completed: false,
    });

    tasksLeft++;
    updateTasksLeft();
    sendToLocalStorage(tasks);
}

// Event Listeners
buttonAdd.addEventListener("click", addTask);

inputAdd.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});

todoList.addEventListener("click", (event) => {
    const taskElement = event.target.closest(".task");
    if (!taskElement) return;

    const taskId = parseInt(taskElement.querySelector("input").id.split("-")[1]);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    if (event.target.closest(".delete-btn")) {
        const isChecked = taskElement.querySelector(".task-checkbox").checked;

        tasks.splice(taskIndex, 1);
        playSound(deleteSound);
        animateTaskRemoval(taskElement).then(checkEmptyState);

        if (!isChecked) {
            tasksLeft--;
            updateTasksLeft();
        }

        sendToLocalStorage(tasks);
        return;
    }

    if (event.target.closest(".task-checkbox")) {
        const isChecked = event.target.checked;

        tasks[taskIndex].completed = isChecked;
        tasksLeft += isChecked ? -1 : 1;
        updateTasksLeft();

        if (isChecked) playSound(taskDoneSound);

        sendToLocalStorage(tasks);
    }
});

clearBtn.addEventListener("click", () => {
    const completedElements = Array.from(todoList.querySelectorAll(".task"))
        .filter(task => task.querySelector(".task-checkbox").checked);

    if (completedElements.length === 0) return;

    tasks = tasks.filter(task => !task.completed);
    tasksLeft = tasks.length;
    updateTasksLeft();
    playSound(clearAllSound);
    sendToLocalStorage(tasks);

    Promise.all(completedElements.map(animateTaskRemoval)).then(checkEmptyState);
});

/* ==========================================================================
   INIT
   ========================================================================== */
async function init() {
    const saved = getSavedSettings();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js?v=9").catch((error) => {
            console.error("Service worker registration failed:", error);
        });
    }

    applyTheme(saved.theme);

    try {
        await setLanguage(saved.language); // Load translations before rendering tasks.
        render();

        if (!saved.onboarded) openSettings();
    } finally {
        document.documentElement.setAttribute("data-app-ready", "true");
    }
}

init();