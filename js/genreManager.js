import { DOM_ELEMENTS, getElement } from './utils.js';

export const GenreManager = {
    addGenre: async function () {
        const newGenre = getElement(DOM_ELEMENTS.newGenreInput).value.trim();
        if (newGenre) {
            const genres = await new Promise((resolve) => {
                chrome.storage.local.get('genres', (data) => {
                    resolve(data.genres || []);
                });
            });
            if (!genres.includes(newGenre)) {
                genres.push(newGenre);
                await new Promise((resolve) => {
                    chrome.storage.local.set({ genres }, () => {
                        console.log('Genre added');
                        resolve();
                    });
                });
                getElement(DOM_ELEMENTS.newGenreInput).value = '';
                GenreManager.displayGenres();
                GenreManager.updateGenreSelects();
            }
        }
    },
    removeGenre: async function (genre) {
        const { genres, tasks } = await new Promise((resolve) => {
            chrome.storage.local.get(['genres', 'tasks'], (data) => {
                resolve({ genres: data.genres || [], tasks: data.tasks || [] });
            });
        });
        const updatedGenres = genres.filter(g => g !== genre);
        const updatedTasks = tasks.map(task => {
            if (task.genre === genre) {
                task.genre = '';
            }
            return task;
        });
        await new Promise((resolve) => {
            chrome.storage.local.set({ genres: updatedGenres, tasks: updatedTasks }, () => {
                console.log('Genre removed');
                resolve();
            });
        });
        GenreManager.displayGenres();
        GenreManager.updateGenreSelects();
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
    }
};
