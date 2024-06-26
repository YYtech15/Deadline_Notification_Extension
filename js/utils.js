export const DOM_ELEMENTS = {
    addTaskBtn: 'addTask',
    addGenreBtn: 'addGenre',
    taskNameInput: 'taskName',
    dueDateInput: 'dueDate',
    taskGenreSelect: 'taskGenre',
    genreFilterSelect: 'genreFilter',
    newGenreInput: 'newGenre',
    taskListDiv: 'taskList',
    genreListDiv: 'genreList',
    openGenreModalBtn: 'openGenreModal',
    genreModal: 'genreModal'
};

export const getElement = (id) => document.getElementById(id);

export const getDaysUntil = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
};
