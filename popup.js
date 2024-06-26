document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('addTask');
    const taskNameInput = document.getElementById('taskName');
    const dueDateInput = document.getElementById('dueDate');
    const taskListDiv = document.getElementById('taskList');

    // Function to add a task
    function addTask() {
        const taskName = taskNameInput.value;
        const dueDate = dueDateInput.value;
        if (taskName && dueDate) {
            chrome.storage.sync.get('tasks', function (data) {
                const tasks = data.tasks || [];
                tasks.push({ name: taskName, dueDate: dueDate });
                chrome.storage.sync.set({ tasks: tasks }, function () {
                    console.log('Task saved');
                    displayTasks();
                });
            });
            taskNameInput.value = '';
            dueDateInput.value = '';
        }
    }

    // Function to display tasks
    function displayTasks() {
        chrome.storage.sync.get('tasks', function (data) {
            const tasks = data.tasks || [];
            taskListDiv.innerHTML = '';
            tasks.forEach(function (task, index) {
                const daysUntil = getDaysUntil(task.dueDate);
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                taskElement.innerHTML = `
            <strong>${task.name}</strong> - 期日まで${daysUntil}日
            <button onclick="removeTask(${index})">削除</button>
          `;
                taskListDiv.appendChild(taskElement);
            });
        });
    }

    // Function to calculate days until due date
    function getDaysUntil(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Function to remove a task
    window.removeTask = function (index) {
        chrome.storage.sync.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.sync.set({ tasks: tasks }, function () {
                console.log('Task removed');
                displayTasks();
            });
        });
    }

    // Set up event listeners
    addTaskBtn.addEventListener('click', addTask);

    // Initial display
    displayTasks();
});