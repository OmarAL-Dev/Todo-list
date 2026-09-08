const inputAdd = document.querySelector("#input-add");
const buttonAdd = document.querySelector("#button-add");

const emptyState = document.querySelector("#empty-state");
const todoList = document.querySelector("#todo-list");

const clearCompleted = document.querySelector("#clear-completed");
const tasksCount = document.querySelector("#tasks-count");


let taskCounter = 1

function addTask() {
    let inputNameTask = inputAdd.value;
    


    if (inputNameTask.length > 0) {
        

        emptyState.classList.add("hidden")
        todoList.insertAdjacentHTML("beforeend",`
                <li class="task"> 
                    <input type="checkbox" id="task-${taskCounter}" class="task-checkbox">
                    <label for="task-${taskCounter}" class="task-text">${inputNameTask}</label>
                    <span class="delete-btn"><img src="assets/images/remove.png"></span>
                </li>
            `)
        inputAdd.value = null

        taskCounter++
    } else {
        inputAdd.style.borderBottom = "1px solid rgba(240, 6, 6, 0.66)";
            setTimeout(() => {
                inputAdd.style.borderBottom = "1px solid rgba(0, 0, 0, 0.2)";
            }, 500);
    }
}


buttonAdd.addEventListener("click", addTask)
inputAdd.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});


todoList.addEventListener("click", (event) => {
    if (event.target.closest(".delete-btn")) {
        let task = event.target.closest(".task");
        task.remove();
    }
});



