document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('addTask');
    const applyFilterBtn = document.getElementById('applyFilter');
    const taskNameInput = document.getElementById('taskName');
    const dueDateInput = document.getElementById('dueDate');
    const taskGenreSelect = document.getElementById('taskGenre');
    const filterGenreSelect = document.getElementById('filterGenre');
    const taskListDiv = document.getElementById('taskList');

    function addTask() {
        const taskName = taskNameInput.value;
        const dueDate = dueDateInput.value;
        const genre = taskGenreSelect.value;

        if (taskName && dueDate && genre) {
            chrome.storage.sync.get('tasks', function (data) {
                const tasks = data.tasks || [];
                tasks.push({ name: taskName, dueDate, genre });
                chrome.storage.sync.set({ tasks }, function () {
                    console.log('Task saved');
                    displayTasks();
                });
            });
            taskNameInput.value = '';
            dueDateInput.value = '';
            taskGenreSelect.value = '';
        }
    }

    function displayTasks(filterGenre = '') {
        chrome.storage.sync.get('tasks', function (data) {
            const tasks = data.tasks || [];
            taskListDiv.innerHTML = '';
            tasks.filter(task => !filterGenre || task.genre === filterGenre)
                .forEach(function (task, index) {
                    const daysUntil = getDaysUntil(task.dueDate);
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item';
                    taskElement.innerHTML = `
            <strong>${task.name}</strong> - ${task.genre} - 期日まで${daysUntil}日
            <button class="delete-btn" data-index="${index}">削除</button>
          `;
                    taskListDiv.appendChild(taskElement);
                });

            // 削除ボタンにイベントリスナーを追加
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index'));
                    removeTask(index);
                });
            });
        });
    }

    function getDaysUntil(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function removeTask(index) {
        chrome.storage.sync.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.sync.set({ tasks }, function () {
                console.log('Task removed');
                displayTasks(filterGenreSelect.value);
            });
        });
    }

    function applyFilter() {
        const genre = filterGenreSelect.value;
        displayTasks(genre);
    }

    addTaskBtn.addEventListener('click', addTask);
    applyFilterBtn.addEventListener('click', applyFilter);

    // 初期表示
    displayTasks();
});