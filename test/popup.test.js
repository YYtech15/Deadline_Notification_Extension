import { JSDOM } from 'jsdom';
import chrome from 'sinon-chrome';
import { TaskManager } from '../js/taskManager.js';
import { GenreManager } from '../js/genreManager.js';
import { getDaysUntil, formatDate } from '../js/utils.js';
import { jest } from '@jest/globals'; // 追加: jestのインポート

const DOM_ELEMENTS = {
    newGenreInput: 'newGenre',
    taskNameInput: 'taskName',
    dueDateInput: 'dueDate',
    taskGenreSelect: 'taskGenre',
    genreFilterSelect: 'genreFilter',
    taskListDiv: 'taskList'
};

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
        document.getElementById(DOM_ELEMENTS.taskListDiv).innerHTML = '';
        document.getElementById('genreList').innerHTML = '';
        jest.clearAllMocks(); // jestのクリア
    });

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
        const newGenreInput = document.createElement('input');
        newGenreInput.id = DOM_ELEMENTS.newGenreInput;
        newGenreInput.value = '新しいジャンル';
        document.body.appendChild(newGenreInput);

        const setSpy = jest.spyOn(chrome.storage.local, 'set');

        await GenreManager.addGenre();

        expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
            genres: expect.any(Array)
        }));
        expect(setSpy).toHaveBeenCalledTimes(1);

        document.body.removeChild(newGenreInput);
        setSpy.mockRestore();
    });

    test('removeGenre removes a genre and updates tasks', async () => {
        const genreToRemove = 'ジャンル1';
        const getSpy = jest.spyOn(chrome.storage.local, 'get').mockImplementation((keys, callback) => {
            callback({ genres: ['ジャンル1', 'ジャンル2'], tasks: [{ genre: 'ジャンル1' }, { genre: 'ジャンル2' }] });
        });
        const setSpy = jest.spyOn(chrome.storage.local, 'set');

        await GenreManager.removeGenre(genreToRemove);

        expect(setSpy).toHaveBeenCalledWith({
            genres: ['ジャンル2'],
            tasks: [{ genre: '' }, { genre: 'ジャンル2' }]
        });
        expect(setSpy).toHaveBeenCalledTimes(1);

        getSpy.mockRestore();
        setSpy.mockRestore();
    });

    test('displayTasks filters tasks by genre', async () => {
        const mockTasks = [
            { name: 'タスク1', dueDate: '2023-12-31', genre: 'ジャンル1' },
            { name: 'タスク2', dueDate: '2024-01-15', genre: 'ジャンル2' }
        ];
        chrome.storage.local.get.yields({ tasks: mockTasks });
        document.getElementById(DOM_ELEMENTS.genreFilterSelect).value = 'ジャンル1';

        await TaskManager.displayTasks();

        const taskListDiv = document.getElementById(DOM_ELEMENTS.taskListDiv);
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
        const taskNameInput = document.createElement('input');
        taskNameInput.id = DOM_ELEMENTS.taskNameInput;
        taskNameInput.value = '';
        document.body.appendChild(taskNameInput);

        const setSpy = jest.spyOn(chrome.storage.local, 'set');

        await TaskManager.addTask();

        expect(setSpy).not.toHaveBeenCalled();

        document.body.removeChild(taskNameInput);
        setSpy.mockRestore();
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
