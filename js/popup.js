import { DOM_ELEMENTS } from './utils.js';
import { TaskManager } from './taskManager.js';
import { GenreManager } from './genreManager.js';
import { ModalManager } from './modalManager.js';

document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners
    document.getElementById(DOM_ELEMENTS.addTaskBtn).addEventListener('click', TaskManager.addTask);
    document.getElementById(DOM_ELEMENTS.addGenreBtn).addEventListener('click', GenreManager.addGenre);
    document.getElementById(DOM_ELEMENTS.genreFilterSelect).addEventListener('change', TaskManager.displayTasks);
    const originalRemoveGenre = GenreManager.removeGenre;
    GenreManager.removeGenre = function (genre) {
        originalRemoveGenre.call(GenreManager, genre);
        TaskManager.displayTasks();
    };

    // Initialize components
    TaskManager.displayTasks();
    GenreManager.displayGenres();
    GenreManager.updateGenreSelects();
    ModalManager.init();
});
