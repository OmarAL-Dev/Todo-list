// Select main elements
const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");

const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");

const clearBtn = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");

const taskTemplate = document.querySelector("#task-template");

const taskDoneSound = new Audio('../assets/sounds/done.wav');
const errorSound = new Audio('../assets/sounds/erorr.wav');
const deleteSound = new Audio('../assets/sounds/delete.mp3');
const clearAllSound = new Audio('../assets/sounds/clearAll.wav');
const taskStart = new Audio('../assets/sounds/startTask.wav');


// Counters
let taskCounter = 1;
let tasksLeft = 0;

// Add new task
function addTask() {
    let inputNameTask = inputAdd.value.trim();

    if (inputNameTask.trim().length > 0) {
        emptyState.classList.add("hidden");

        const clone = taskTemplate.content.cloneNode(true);
        const input = clone.querySelector("input");
        const label = clone.querySelector("label");
        const taskElement = clone.querySelector(".task");

        label.textContent = inputNameTask;
        input.id = `task-${taskCounter}`;
        label.setAttribute("for", `task-${taskCounter}`);


        animateTaskInsertion(taskElement);
        inputAdd.value = "";

        taskStart.currentTime = 0;
        taskStart.play()
        taskCounter++;
        tasksLeft++;
        tasksCount.textContent = tasksLeft;
    } else {
        errorSound.currentTime = 0;
        errorSound.play()
        inputAdd.style.borderBottom = "1px solid rgba(240, 6, 6, 0.66)";
        setTimeout(() => {
            inputAdd.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
        }, 500);
    }
}

// Show empty state if no tasks
function checkEmptyState() {
    if (todoList.querySelectorAll(".task").length === 0) {
        emptyState.classList.remove("hidden");
    }
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

function animateTaskInsertion(taskElement) {
    taskElement.classList.add("adding");
    todoList.appendChild(taskElement);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            taskElement.classList.remove("adding");
        });
    });
}

{
    // Event listeners for adding tasks
    buttonAdd.addEventListener("click", addTask);

    inputAdd.addEventListener("keydown", (event) => {
        if (event.key === "Enter") addTask();
    });
}

// Handle delete and checkbox toggle
todoList.addEventListener("click", (event) => {

    const taskElement = event.target.closest(".task");
    if (!taskElement) return;

    if (event.target.closest(".delete-btn")) {
            const isChecked = taskElement.querySelector(".task-checkbox").checked;

            deleteSound.currentTime = 0;
            deleteSound.play();

            animateTaskRemoval(taskElement).then(() => {
                checkEmptyState();
            });

            if (!isChecked) {
                tasksLeft--;
                tasksCount.textContent = tasksLeft;
            }
            return;
        }

    if (event.target.closest(".task-checkbox")) {
        if (event.target.checked) {
            taskDoneSound.currentTime = 0;
            taskDoneSound.play()
            tasksLeft--;
        } else {
            tasksLeft++;
        }
        tasksCount.textContent = tasksLeft;
    }
});

// Clear all completed tasks
clearBtn.addEventListener("click", () => {
    const completedTasks = Array.from(todoList.querySelectorAll(".task"))
        .filter(task => task.querySelector(".task-checkbox").checked);

    if (completedTasks.length === 0) return;

    clearAllSound.currentTime = 0;
    clearAllSound.play();

    Promise.all(completedTasks.map(task => animateTaskRemoval(task)))
        .then(() => checkEmptyState());
});