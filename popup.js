document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('addTask');
    const addGenreBtn = document.getElementById('addGenre');
    const taskNameInput = document.getElementById('taskName');
    const dueDateInput = document.getElementById('dueDate');
    const taskGenreSelect = document.getElementById('taskGenre');
    const genreFilterSelect = document.getElementById('genreFilter');
    const newGenreInput = document.getElementById('newGenre');
    const taskListDiv = document.getElementById('taskList');
    const genreListDiv = document.getElementById('genreList');
    const openGenreModalBtn = document.getElementById('openGenreModal');
    const genreModal = document.getElementById('genreModal');

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
                    taskNameInput.value = '';
                    dueDateInput.value = '';
                    taskGenreSelect.value = '';
                });
            });
        }
    }

    function displayTasks() {
        const filterGenre = genreFilterSelect.value;
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            taskListDiv.innerHTML = '';

            // タスクを期日でソート
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
              <button class="delete-task-btn" data-index="${tasks.indexOf(task)}">削除</button>
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
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ja-JP', options);
    }

    function removeTask(index) {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.local.set({ tasks }, function () {
                console.log('Task removed');
                displayTasks();
            });
        });
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
            genres.forEach(function (genre) {
                const genreElement = document.createElement('div');
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
            genreFilterSelect.innerHTML = '<option value="">全てのジャンル</option>';
            genres.forEach(genre => {
                taskGenreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
                genreFilterSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        });
    }

    // モーダル関連の機能
    openGenreModalBtn.onclick = function () {
        genreModal.style.display = "block";
    }

    document.querySelector('.close').onclick = function () {
        genreModal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == genreModal) {
            genreModal.style.display = "none";
        }
    }

    addTaskBtn.addEventListener('click', addTask);
    addGenreBtn.addEventListener('click', addGenre);
    genreFilterSelect.addEventListener('change', displayTasks);

    // 初期表示
    displayTasks();
    displayGenres();
    updateGenreSelects();
});