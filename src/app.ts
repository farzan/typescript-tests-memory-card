import { Game, IGameDOM as IGameDOM } from "./MemoryCardGame.js";

document.addEventListener('DOMContentLoaded', () => {
    const dom: IGameDOM = {
        window: window,
        cards: getElement<HTMLDivElement>('cards'),
        start: getElement<HTMLButtonElement>('btn-start'),
        reset: getElement<HTMLButtonElement>('btn-reset'),
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
