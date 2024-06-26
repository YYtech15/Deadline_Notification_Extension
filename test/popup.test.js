const chrome = require('sinon-chrome');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// JSDOM setup
const html = fs.readFileSync(path.resolve(__dirname, '../popup.html'), 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;
global.chrome = chrome;

// Load popup.js
const popupJs = fs.readFileSync(path.resolve(__dirname, '../popup.js'), 'utf8');
eval(popupJs);

describe('Job Application Tracker', () => {
    beforeEach(() => {
        chrome.storage.local.get.yields({ tasks: [] });
        chrome.storage.local.set.yields();
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

});