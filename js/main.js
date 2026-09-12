// Select main elements
const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");

const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");

const clearBtn = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");

const taskTemplate = document.querySelector("#task-template");

// Counters
let taskCounter = 1;
let tasksLeft = 0;

// Add tasks
function addTask() {
    let inputNameTask = inputAdd.value.trim(); // إصلاح: تجاهل المسافات الفارغة

    if (inputNameTask.length > 0) {
        emptyState.classList.add("hidden");

        const clone = taskTemplate.content.cloneNode(true);
        const input = clone.querySelector("input");
        const label = clone.querySelector("label");

        label.textContent = inputNameTask;
        input.id = `task-${taskCounter}`;
        label.setAttribute("for", `task-${taskCounter}`);

        todoList.appendChild(clone);

        inputAdd.value = "";
        taskCounter++;
        tasksLeft++;
        tasksCount.textContent = tasksLeft;
    } else {
        inputAdd.style.borderBottom = "1px solid rgba(240, 6, 6, 0.66)";
        setTimeout(() => {
            inputAdd.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
        }, 500);
    }
}

// إصلاح: نعدّ عناصر .task فقط، لا كل الأبناء
function checkEmptyState() {
    if (todoList.querySelectorAll(".task").length === 0) {
        emptyState.classList.remove("hidden");
    }
}

buttonAdd.addEventListener("click", addTask);

inputAdd.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});

// Delete + toggle
todoList.addEventListener("click", (event) => {
    const taskElement = event.target.closest(".task");
    if (!taskElement) return;

    if (event.target.closest(".delete-btn")) {
        const isChecked = taskElement.querySelector(".task-checkbox").checked;
        taskElement.remove();

        if (!isChecked) {
            tasksLeft--;
            tasksCount.textContent = tasksLeft;
        }
        checkEmptyState();
        return; // إصلاح: نتوقف هنا بعد الحذف
    }

    if (event.target.closest(".task-checkbox")) {
        if (event.target.checked) {
            tasksLeft--;
        } else {
            tasksLeft++;
        }
        tasksCount.textContent = tasksLeft;
    }
});

// إصلاح جذري: نتصفح عناصر .task فقط (querySelectorAll ترجع قائمة ثابتة وآمنة للحذف أثناء التكرار)
clearBtn.addEventListener("click", () => {
    todoList.querySelectorAll(".task").forEach((task) => {
        const checkbox = task.querySelector(".task-checkbox");
        if (checkbox && checkbox.checked) {
            task.remove();
        }
    });
    checkEmptyState();
});