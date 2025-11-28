import { Game, IGameDOM as IGameDOM } from "./MemoryCardGame.js";

document.addEventListener('DOMContentLoaded', () => {
    const dom: IGameDOM = {
        window: window,
        cards: getElement<HTMLDivElement>('cards'),
        cardTemplate: getElement<HTMLTemplateElement>('card-template'),
        start: getElement<HTMLButtonElement>('btn-start'),
        timer: getElement<HTMLDivElement>('timer'),
        applause: getElement<HTMLDivElement>('applause'),
        cheat: getElement<HTMLInputElement>('cheat'),
    };

    new Game(dom);
});

function getElement<T>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Element "${id}" not found!`);
    }

    return el as T;
};
