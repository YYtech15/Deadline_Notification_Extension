document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('addTask');
    const applyFilterBtn = document.getElementById('applyFilter');
    const addGenreBtn = document.getElementById('addGenre');
    const taskNameInput = document.getElementById('taskName');
    const dueDateInput = document.getElementById('dueDate');
    const taskGenreSelect = document.getElementById('taskGenre');
    const filterGenreSelect = document.getElementById('filterGenre');
    const newGenreInput = document.getElementById('newGenre');
    const taskListDiv = document.getElementById('taskList');
    const genreListDiv = document.getElementById('genreList');

    function addTask() {
        const taskName = taskNameInput.value;
        const dueDate = dueDateInput.value;
        const genre = taskGenreSelect.value;

        if (taskName && dueDate && genre) {
            chrome.storage.local.get('tasks', function (data) {
                const tasks = data.tasks || [];
                tasks.push({ name: taskName, dueDate, genre });
                chrome.storage.local.set({ tasks }, function () {
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
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            taskListDiv.innerHTML = '';
            tasks.filter(task => !filterGenre || task.genre === filterGenre)
                .forEach(function (task, index) {
                    const daysUntil = getDaysUntil(task.dueDate);
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item';
                    taskElement.innerHTML = `
            <strong>${task.name}</strong> - ${task.genre} - 期日まで${daysUntil}日
            <button class="delete-task-btn" data-index="${index}">削除</button>
          `;
                    taskListDiv.appendChild(taskElement);
                });

            document.querySelectorAll('.delete-task-btn').forEach(btn => {
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
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.local.set({ tasks }, function () {
                console.log('Task removed');
                displayTasks(filterGenreSelect.value);
            });
        });
    }

    function applyFilter() {
        const genre = filterGenreSelect.value;
        displayTasks(genre);
    }

    function addGenre() {
        const newGenre = newGenreInput.value.trim();
        if (newGenre) {
            chrome.storage.local.get('genres', function (data) {
                const genres = data.genres || [];
                if (!genres.includes(newGenre)) {
                    genres.push(newGenre);
                    chrome.storage.local.set({ genres }, function () {
                        console.log('Genre added');
                        newGenreInput.value = '';
                        displayGenres();
                        updateGenreSelects();
                    });
                }
            });
        }
    }

    function displayGenres() {
        chrome.storage.local.get('genres', function (data) {
            const genres = data.genres || [];
            genreListDiv.innerHTML = '';
            genres.forEach(function (genre, index) {
                const genreElement = document.createElement('div');
                genreElement.className = 'genre-item';
                genreElement.innerHTML = `
            ${genre}
            <button class="delete-genre-btn" data-genre="${genre}">削除</button>
          `;
                genreListDiv.appendChild(genreElement);
            });

            document.querySelectorAll('.delete-genre-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const genre = this.getAttribute('data-genre');
                    removeGenre(genre);
                });
            });
        });
    }

    function removeGenre(genre) {
        chrome.storage.local.get(['genres', 'tasks'], function (data) {
            const genres = data.genres || [];
            const tasks = data.tasks || [];
            const updatedGenres = genres.filter(g => g !== genre);
            const updatedTasks = tasks.map(task => {
                if (task.genre === genre) {
                    task.genre = '';
                }
                return task;
            });
            chrome.storage.local.set({ genres: updatedGenres, tasks: updatedTasks }, function () {
                console.log('Genre removed');
                displayGenres();
                updateGenreSelects();
                displayTasks();
            });
        });
    }

    function updateGenreSelects() {
        chrome.storage.local.get('genres', function (data) {
            const genres = data.genres || [];
            taskGenreSelect.innerHTML = '<option value="">ジャンルを選択</option>';
            filterGenreSelect.innerHTML = '<option value="">全てのジャンル</option>';
            genres.forEach(genre => {
                taskGenreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
                filterGenreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        });
    }

    addTaskBtn.addEventListener('click', addTask);
    applyFilterBtn.addEventListener('click', applyFilter);
    addGenreBtn.addEventListener('click', addGenre);

    // 初期表示
    displayTasks();
    displayGenres();
    updateGenreSelects();
});