import { JSDOM } from 'jsdom';
import chrome from 'sinon-chrome';
import { TaskManager } from '../js/taskManager.js';
import { GenreManager } from '../js/genreManager.js';
import { getDaysUntil, formatDate } from '../js/utils.js';

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <input id="taskName" />
  <input id="dueDate" />
  <select id="taskGenre"></select>
  <button id="addTask">タスクを追加</button>
  <div id="taskList"></div>
  <input id="newGenre" />
  <button id="addGenre">ジャンルを追加</button>
  <div id="genreList"></div>
  <select id="genreFilter"></select>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.chrome = chrome;

describe('Popup functionality', () => {
    beforeEach(() => {
        chrome.storage.local.clear();
        document.getElementById('taskList').innerHTML = '';
        document.getElementById('genreList').innerHTML = '';
    });

    // 既存のテストケース...

    test('removeTask removes a task', async () => {
        const mockTasks = [
            { name: 'タスク1', dueDate: '2023-12-31', genre: 'テスト' },
            { name: 'タスク2', dueDate: '2024-01-15', genre: 'テスト' }
        ];
        chrome.storage.local.get.yields({ tasks: mockTasks });
        chrome.storage.local.set.yields(null);

        await TaskManager.removeTask(0);

        expect(chrome.storage.local.set.calledOnce).toBeTruthy();
        expect(chrome.storage.local.set.firstCall.args[0]).toEqual({
            tasks: [{ name: 'タスク2', dueDate: '2024-01-15', genre: 'テスト' }]
        });
    });

    test('addGenre adds a new genre', async () => {
        document.getElementById('newGenre').value = '新しいジャンル';
        chrome.storage.local.get.yields({ genres: ['既存ジャンル'] });
        chrome.storage.local.set.yields(null);

        await GenreManager.addGenre();

        expect(chrome.storage.local.set.calledOnce).toBeTruthy();
        expect(chrome.storage.local.set.firstCall.args[0]).toEqual({
            genres: ['既存ジャンル', '新しいジャンル']
        });
    });

    test('removeGenre removes a genre and updates tasks', async () => {
        const mockGenres = ['ジャンル1', 'ジャンル2'];
        const mockTasks = [
            { name: 'タスク1', dueDate: '2023-12-31', genre: 'ジャンル1' },
            { name: 'タスク2', dueDate: '2024-01-15', genre: 'ジャンル2' }
        ];
        chrome.storage.local.get.yields({ genres: mockGenres, tasks: mockTasks });
        chrome.storage.local.set.yields(null);

        await GenreManager.removeGenre('ジャンル1');

        expect(chrome.storage.local.set.calledOnce).toBeTruthy();
        const setArg = chrome.storage.local.set.firstCall.args[0];
        expect(setArg.genres).toEqual(['ジャンル2']);
        expect(setArg.tasks[0].genre).toBe('');
        expect(setArg.tasks[1].genre).toBe('ジャンル2');
    });

    test('displayTasks filters tasks by genre', async () => {
        const mockTasks = [
            { name: 'タスク1', dueDate: '2023-12-31', genre: 'ジャンル1' },
            { name: 'タスク2', dueDate: '2024-01-15', genre: 'ジャンル2' }
        ];
        chrome.storage.local.get.yields({ tasks: mockTasks });
        document.getElementById('genreFilter').value = 'ジャンル1';

        await TaskManager.displayTasks();

        const taskListDiv = document.getElementById('taskList');
        expect(taskListDiv.children.length).toBe(1);
        expect(taskListDiv.innerHTML).toContain('タスク1');
        expect(taskListDiv.innerHTML).not.toContain('タスク2');
    });

    test('getDaysUntil calculates days correctly', () => {
        const today = new Date();
        const futureDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days in the future
        expect(getDaysUntil(futureDate.toISOString().split('T')[0])).toBe(5);
    });

    test('formatDate formats date correctly', () => {
        const date = new Date('2023-12-31');
        expect(formatDate(date.toISOString())).toBe('2023年12月31日');
    });

    test('addTask handles empty input', async () => {
        document.getElementById('taskName').value = '';
        document.getElementById('dueDate').value = '';
        document.getElementById('taskGenre').value = '';

        await TaskManager.addTask();

        expect(chrome.storage.local.set.called).toBeFalsy();
    });

    test('updateGenreSelects updates select options', async () => {
        const mockGenres = ['ジャンル1', 'ジャンル2'];
        chrome.storage.local.get.yields({ genres: mockGenres });

        await GenreManager.updateGenreSelects();

        const taskGenreSelect = document.getElementById('taskGenre');
        const genreFilterSelect = document.getElementById('genreFilter');
        expect(taskGenreSelect.children.length).toBe(3); // Including default option
        expect(genreFilterSelect.children.length).toBe(3); // Including default option
        expect(taskGenreSelect.innerHTML).toContain('ジャンル1');
        expect(taskGenreSelect.innerHTML).toContain('ジャンル2');
        expect(genreFilterSelect.innerHTML).toContain('ジャンル1');
        expect(genreFilterSelect.innerHTML).toContain('ジャンル2');
    });
});