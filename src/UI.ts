type ClicHandler = (e: Event) => void;

type CardElement = HTMLDivElement;

interface IGameDOM {
    window: Window,
    cards: HTMLDivElement,
    cardTemplate: HTMLTemplateElement,
    timer: HTMLDivElement;
    applause: HTMLDivElement;

    start: HTMLButtonElement,

    cheat: HTMLInputElement,
}

interface IUI {
    createCard(text: string): CardElement;
    hide(card: CardElement): void;
    reveal(card: CardElement): void;
    setClickHandler(card: CardElement, callback: ClicHandler): void;
    appendCard(card: CardElement): void;
    updateTimer(seconds: number): void;
    showApplause(): void;
    hideApplause(): void;
}

function uiFactory(dom: IGameDOM): IUI {
    return new UI(dom);
}

class UI implements IUI {
    private dom: IGameDOM;

    public constructor(dom: IGameDOM) {
        this.dom = dom;

        this.setUpCheat();
    }

    public createCard(text: string): CardElement {
        const el: CardElement = this.dom.cardTemplate.content.cloneNode(true) as CardElement;
        const card: CardElement = el.children[0] as CardElement;

        card.classList.add('hide');
        card.querySelector<HTMLDivElement>('.card-content')!.innerHTML = text;

        return card;
    }

    public reveal(card: CardElement): void {
        card.classList.remove('hide');
    }

    public hide(card: CardElement): void {
        card.classList.add('hide');
    }

    public setClickHandler(card: CardElement, callback: ClicHandler): void {
        card.addEventListener('click', callback);
    }

    public appendCard(card: CardElement): void {
        this.dom.cards.appendChild(card);
    }

    private setUpCheat(): void {
        this.dom.cheat.addEventListener('change', this.onCheatChange);
        this.onCheatChange();
    }

    private onCheatChange: () => void = () => {
        if (this.dom.cheat.checked) {
            this.dom.cards.classList.add('cheating');
        } else {
            this.dom.cards.classList.remove('cheating');
        }
    }

    public updateTimer(seconds: number): void {
        this.dom.timer.innerHTML = this.formatTime(seconds);
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds - (mins * 60);

        return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    public showApplause(): void {
        this.dom.applause.classList.remove('hidden');
    }

    public hideApplause(): void {
        this.dom.applause.classList.add('hidden');
    }
}

export type { CardElement, ClicHandler, IUI, IGameDOM }
export { uiFactory }
