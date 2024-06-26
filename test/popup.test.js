// test/popup.test.js
const chrome = require('sinon-chrome');
global.chrome = chrome;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, '../popup.html'), 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;

const popupJs = fs.readFileSync(path.resolve(__dirname, '../popup.js'), 'utf8');
eval(popupJs);

describe('Job Application Tracker', () => {
    beforeEach(() => {
        chrome.storage.sync.get.yields({ tasks: [] });
        chrome.storage.sync.set.yields();
    });

    test('addTask adds a new task with genre', () => {
        document.getElementById('taskName').value = 'New Task';
        document.getElementById('dueDate').value = '2023-12-31';
        document.getElementById('taskGenre').value = 'ES';

        document.getElementById('addTask').click();

        expect(chrome.storage.sync.set.calledOnce).toBe(true);
        const setCall = chrome.storage.sync.set.getCall(0);
        expect(setCall.args[0].tasks[0]).toEqual({
            name: 'New Task',
            dueDate: '2023-12-31',
            genre: 'ES'
        });
    });

    test('applyFilter filters tasks by genre correctly', () => {
        chrome.storage.sync.get.yields({
            tasks: [
                { name: 'Task 1', genre: 'ES', dueDate: '2023-12-31' },
                { name: 'Task 2', genre: '適性検査', dueDate: '2023-12-31' },
                { name: 'Task 3', genre: 'ES', dueDate: '2023-12-31' }
            ]
        });

        document.getElementById('filterGenre').value = 'ES';
        document.getElementById('applyFilter').click();

        const taskList = document.getElementById('taskList');
        expect(taskList.children.length).toBe(2);
        expect(taskList.innerHTML).toContain('Task 1');
        expect(taskList.innerHTML).toContain('Task 3');
        expect(taskList.innerHTML).not.toContain('Task 2');
    });
});