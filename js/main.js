// Select main elements
const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");

const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");

const clearBtn = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");

// Counters
let taskCounter = 1   // used for unique task IDs
let tasksLeft = 0     // number of unfinished tasks

function addTask() {
    let inputNameTask = inputAdd.value;

    if (inputNameTask.length > 0) {

        // Hide "empty state" message once we have a task
        emptyState.classList.add("hidden")

        // Add new task to the list
        todoList.insertAdjacentHTML("beforeend",`
                <li class="task"> 
                    <input type="checkbox" id="task-${taskCounter}" class="task-checkbox">
                    <label for="task-${taskCounter}" class="task-text">${inputNameTask}</label>
                    <span class="delete-btn"><img src="assets/images/remove.png"></span>
                </li>
            `)
        inputAdd.value = null // clear input field

        taskCounter++
        tasksLeft++
        tasksCount.textContent = tasksLeft
    } else {
        // Show red border if input is empty
        inputAdd.style.borderBottom = "1px solid rgba(240, 6, 6, 0.66)";
            setTimeout(() => {
                inputAdd.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
            }, 500);
    }
}

function checkEmptyState() {
    if (todoList.children.length === 0) {
            emptyState.classList.remove("hidden")
        }
}

// Add task on button click
buttonAdd.addEventListener("click", addTask)

// Add task on Enter key
inputAdd.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

// Handle delete button clicks (event delegation)
todoList.addEventListener("click", (event) => {
    if (event.target.closest(".delete-btn")) {
        let task = event.target.closest(".task");
        let isChecked = task.querySelector(".task-checkbox").checked
        task.remove();

        if(!isChecked) {
            tasksLeft--
            tasksCount.textContent = tasksLeft
        }

        // Show "No tasks" message if list is empty
        checkEmptyState()
    }
});

// Handle checkbox clicks (event delegation)
todoList.addEventListener("click", (event) => {
    if (event.target.closest(".task-checkbox")) {
        let theCondition = event.target.closest(".task-checkbox").checked

        if (theCondition) {
            // Task done, one less task left
            tasksLeft--
            tasksCount.textContent = tasksLeft
        } else {
            // Task undone, add it back
            tasksLeft++
            tasksCount.textContent = tasksLeft
        }
    }
});

// Remove all completed tasks when clear button is clicked
clearBtn.addEventListener("click", () => {
    let tasks = Array.from(todoList.children);

    tasks.forEach(task => {
        let inputCheckBox = task.querySelector(".task-checkbox");

        if (inputCheckBox.checked) {
            task.remove();
        }
    });

    checkEmptyState()
});


