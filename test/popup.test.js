const chrome = require('sinon-chrome');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, '../popup.html'), 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;
global.chrome = chrome;

const popupJs = fs.readFileSync(path.resolve(__dirname, '../popup.js'), 'utf8');
eval(popupJs);

describe('Job Application Tracker', () => {
    beforeEach(() => {
        chrome.storage.local.get.yields({
            tasks: [
                { name: 'Task 1', dueDate: '2023-07-01', genre: 'ES' },
                { name: 'Task 2', dueDate: '2023-06-15', genre: '面接' },
                { name: 'Task 3', dueDate: '2023-06-30', genre: '適性検査' }
            ],
            genres: ['ES', '適性検査', '面接']
        });
        chrome.storage.local.set.yields();

        // DOMをクリア
        document.body.innerHTML = html;
    });

    test('addTask adds a new task', () => {
        document.getElementById('taskName').value = 'New Task';
        document.getElementById('dueDate').value = '2023-12-31';
        document.getElementById('taskGenre').value = 'ES';

        document.getElementById('addTask').click();

        expect(chrome.storage.local.set.calledOnce).toBe(true);
        const setCall = chrome.storage.local.set.getCall(0);
        expect(setCall.args[0].tasks[0]).toEqual({
            name: 'New Task',
            dueDate: '2023-12-31',
            genre: 'ES'
        });
    });

    test('addGenre adds a new genre', () => {
        document.getElementById('newGenre').value = 'New Genre';

        document.getElementById('addGenre').click();

        expect(chrome.storage.local.set.calledOnce).toBe(true);
        const setCall = chrome.storage.local.set.getCall(0);
        expect(setCall.args[0].genres).toContain('New Genre');
    });

    test('removeGenre removes a genre and updates tasks', () => {
        chrome.storage.local.get.yields({
            genres: ['ES', '適性検査', '面接'],
            tasks: [{ name: 'Task 1', dueDate: '2023-12-31', genre: 'ES' }]
        });

        const removeGenreBtn = document.createElement('button');
        removeGenreBtn.className = 'delete-genre-btn';
        removeGenreBtn.setAttribute('data-genre', 'ES');
        document.body.appendChild(removeGenreBtn);

        removeGenreBtn.click();

        expect(chrome.storage.local.set.calledOnce).toBe(true);
        const setCall = chrome.storage.local.set.getCall(0);
        expect(setCall.args[0].genres).not.toContain('ES');
        expect(setCall.args[0].tasks[0].genre).toBe('');
    });

    test('openGenreModal displays the genre modal', () => {
        document.getElementById('openGenreModal').click();
        expect(document.getElementById('genreModal').style.display).toBe('block');
    });

    test('openFilterModal displays the filter modal', () => {
        document.getElementById('openFilterModal').click();
        expect(document.getElementById('filterModal').style.display).toBe('block');
    });

    test('clicking outside the modal closes it', () => {
        document.getElementById('genreModal').style.display = 'block';
        window.onclick(new Event('click', { bubbles: true, cancelable: false, view: window }));
        expect(document.getElementById('genreModal').style.display).toBe('none');
    });

    test('tasks are displayed in order of due date', () => {
        displayTasks();
        const taskItems = document.querySelectorAll('.task-item');
        expect(taskItems[0].textContent).toContain('Task 2');
        expect(taskItems[1].textContent).toContain('Task 3');
        expect(taskItems[2].textContent).toContain('Task 1');
    });

    test('filtering tasks by genre maintains sort order', () => {
        document.getElementById('genreFilter').value = 'ES';
        displayTasks();
        const taskItems = document.querySelectorAll('.task-item');
        expect(taskItems.length).toBe(1);
        expect(taskItems[0].textContent).toContain('Task 1');
    });
});