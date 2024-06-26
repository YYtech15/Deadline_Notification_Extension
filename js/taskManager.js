import { DOM_ELEMENTS, getElement, getDaysUntil, formatDate } from './utils.js';

export const TaskManager = {
    addTask: function () {
        const taskName = getElement(DOM_ELEMENTS.taskNameInput).value;
        const dueDate = getElement(DOM_ELEMENTS.dueDateInput).value;
        const genre = getElement(DOM_ELEMENTS.taskGenreSelect).value;

        if (taskName && dueDate && genre) {
            chrome.storage.local.get('tasks', function (data) {
                const tasks = data.tasks || [];
                tasks.push({ name: taskName, dueDate, genre });
                chrome.storage.local.set({ tasks }, function () {
                    console.log('Task saved');
                    TaskManager.displayTasks();
                    TaskManager.clearInputs();
                });
            });
        }
    },
    displayTasks: function () {
        const filterGenre = getElement(DOM_ELEMENTS.genreFilterSelect).value;
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            const taskListDiv = getElement(DOM_ELEMENTS.taskListDiv);
            taskListDiv.innerHTML = '';

            const sortedTasks = tasks
                .filter(task => !filterGenre || task.genre === filterGenre)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            sortedTasks.forEach(function (task, index) {
                const daysUntil = getDaysUntil(task.dueDate);
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                taskElement.innerHTML = `
                    <strong>${task.name}</strong> - ${task.genre}<br>
                    期日: ${formatDate(task.dueDate)} (あと${daysUntil}日)
                    <button class="delete-task-btn" data-index="${index}">削除</button>
                `;
                taskListDiv.appendChild(taskElement);
            });

            TaskManager.addDeleteListeners();
        });
    },
    removeTask: function (index) {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.local.set({ tasks }, function () {
                console.log('Task removed');
                TaskManager.displayTasks();
            });
        });
    },
    clearInputs: function () {
        getElement(DOM_ELEMENTS.taskNameInput).value = '';
        getElement(DOM_ELEMENTS.dueDateInput).value = '';
        getElement(DOM_ELEMENTS.taskGenreSelect).value = '';
    },
    addDeleteListeners: function () {
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                TaskManager.removeTask(index);
            });
        });
    }
};
