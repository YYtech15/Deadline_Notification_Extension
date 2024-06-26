import { DOM_ELEMENTS, getElement } from './utils.js';

export const ModalManager = {
    init: function () {
        const openGenreModalBtn = getElement(DOM_ELEMENTS.openGenreModalBtn);
        const genreModal = getElement(DOM_ELEMENTS.genreModal);
        const closeBtn = document.querySelector('.close');

        openGenreModalBtn.onclick = function () {
            genreModal.style.display = "block";
        };

        closeBtn.onclick = function () {
            genreModal.style.display = "none";
        };

        window.onclick = function (event) {
            if (event.target == genreModal) {
                genreModal.style.display = "none";
            }
        };
    }
};
