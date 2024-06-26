import { DOM_ELEMENTS, getElement } from './utils.js';

export const GenreManager = {
    addGenre: function () {
        const newGenre = getElement(DOM_ELEMENTS.newGenreInput).value.trim();
        if (newGenre) {
            chrome.storage.local.get('genres', function (data) {
                const genres = data.genres || [];
                if (!genres.includes(newGenre)) {
                    genres.push(newGenre);
                    chrome.storage.local.set({ genres }, function () {
                        console.log('Genre added');
                        getElement(DOM_ELEMENTS.newGenreInput).value = '';
                        GenreManager.displayGenres();
                        GenreManager.updateGenreSelects();
                    });
                }
            });
        }
    },
    displayGenres: function () {
        chrome.storage.local.get('genres', function (data) {
            const genres = data.genres || [];
            const genreListDiv = getElement(DOM_ELEMENTS.genreListDiv);
            genreListDiv.innerHTML = '';
            genres.forEach(function (genre) {
                const genreElement = document.createElement('div');
                genreElement.innerHTML = `
                    ${genre}
                    <button class="delete-genre-btn" data-genre="${genre}">削除</button>
                `;
                genreListDiv.appendChild(genreElement);
            });

            GenreManager.addGenreDeleteListeners();
        });
    },
    removeGenre: function (genre) {
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
                GenreManager.displayGenres();
                GenreManager.updateGenreSelects();
                // TaskManager.displayTasks() の呼び出しを削除
            });
        });
    },
    updateGenreSelects: function () {
        chrome.storage.local.get('genres', function (data) {
            const genres = data.genres || [];
            const taskGenreSelect = getElement(DOM_ELEMENTS.taskGenreSelect);
            const genreFilterSelect = getElement(DOM_ELEMENTS.genreFilterSelect);

            taskGenreSelect.innerHTML = '<option value="">ジャンルを選択</option>';
            genreFilterSelect.innerHTML = '<option value="">全てのジャンル</option>';

            genres.forEach(genre => {
                taskGenreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
                genreFilterSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        });
    },
    addGenreDeleteListeners: function () {
        document.querySelectorAll('.delete-genre-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const genre = this.getAttribute('data-genre');
                GenreManager.removeGenre(genre);
            });
        });
    }
};
