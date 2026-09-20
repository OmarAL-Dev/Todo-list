import { sendToLocalStorage, getFromLocalStorage } from "./localstorage.js";

// Main elements
const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");
const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");
const clearBtn = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");
const taskTemplate = document.querySelector("#task-template");
const settingDialog = document.querySelector('#settings-dialog');
const settingsOptions = document.querySelector('.settings-options');
const buttonSettingsFinish = document.querySelector('#button-settings-finish');
const settingsBtn = document.querySelector('#settings-btn');

// Sound effects
const taskAddedSound = new Audio('assets/sounds/startTask.wav');
const taskDoneSound = new Audio('assets/sounds/done.wav');
const errorSound = new Audio('assets/sounds/erorr.wav');
const deleteSound = new Audio('assets/sounds/delete.mp3');
const clearAllSound = new Audio('assets/sounds/clearAll.wav');



settingsOptions.addEventListener('change', (event) => {
    document.documentElement.setAttribute("data-theme", event.target.value)
    localStorage.setItem('thame',`${event.target.value}`)
})

buttonSettingsFinish.addEventListener('click',() => {
    localStorage.setItem('settings','1')
})

settingsBtn.addEventListener('click',() => {
    settingDialog.showModal()
})

document.addEventListener('DOMContentLoaded', () => {
    const thame = localStorage.getItem('thame')
    const settings = localStorage.getItem('settings')

    if(settings !== '1') {
        settingDialog.showModal()
    }

    if(thame == 'dark') {
        document.documentElement.setAttribute("data-theme", "dark")
    }else {
        document.documentElement.setAttribute("data-theme", "light")
    }
})

// State
let nextTaskId = 0;   
let tasksLeft = 0;
let tasks = [];       

// Sound helper
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
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

        todoList.appendChild(clone);
    });

    tasksLeft = tasks.filter(task => !task.completed).length;
    tasksCount.textContent = tasksLeft;
    nextTaskId = tasks.reduce((max, task) => task.id > max ? task.id : max, 0);
}

render();

// Add Task Function
function addTask() {
    const taskText = inputAdd.value.trim();

    if (taskText.length === 0) {
        playSound(errorSound);
        inputAdd.style.borderBottom = "1px solid rgba(240, 6, 6, 0.66)";
        setTimeout(() => {
            inputAdd.style.borderBottom = "1px solid var(--input-border)";
        }, 500);
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

    animateTaskInsertion(taskElement);
    playSound(taskAddedSound);
    inputAdd.value = "";

    tasks.push({
        id: nextTaskId,
        text: taskText,
        completed: false,
    });

    tasksLeft++;
    tasksCount.textContent = tasksLeft;
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
            tasksCount.textContent = tasksLeft;
        }

        sendToLocalStorage(tasks);
        return;
    }

    if (event.target.closest(".task-checkbox")) {
        const isChecked = event.target.checked;

        tasks[taskIndex].completed = isChecked;
        tasksLeft += isChecked ? -1 : 1;
        tasksCount.textContent = tasksLeft;

        if (isChecked) playSound(taskDoneSound);

        sendToLocalStorage(tasks);
    }
});

clearBtn.addEventListener("click", () => {
    const completedElements = Array.from(todoList.querySelectorAll(".task"))
        .filter(task => task.querySelector(".task-checkbox").checked);

    if (completedElements.length === 0) return;

    tasks = tasks.filter(task => !task.completed);
    playSound(clearAllSound);
    sendToLocalStorage(tasks);

    Promise.all(completedElements.map(animateTaskRemoval)).then(checkEmptyState);
});