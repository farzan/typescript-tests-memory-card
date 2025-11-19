import { CardElement, IUI, uiFactory, IGameDOM } from "./UI.js"

type Card = {
    value: string,
    revealed: boolean,
    solved: boolean,
    otherCard?: Card,
    el: CardElement,
    timeoutHandler: number|null,
}

type Cards = Array<Card>;

type ElementToCardMap = WeakMap<CardElement, Card>

class Game {
    private static readonly numberOfPairs: number = 5;
    private static readonly cardRevealTimeoutMillisecond: number = 3000;

    private dom: IGameDOM;
    private revealedCount: number = 0;
    private previousCard: Card|null = null;
    private elementToCardMap: ElementToCardMap;
    private cards: Cards = [];
    private ui: IUI;

    public constructor(domInterface: IGameDOM) {
        this.dom = domInterface;
        this.elementToCardMap = new WeakMap;
        this.ui = uiFactory(domInterface);

        this.init();
    }

    private init(): void {
        this.dom.start.addEventListener('click', this.start);
        this.dom.reset.addEventListener('click', this.reset);
    }

    private start = (): void => {
        // todo show reset
        // todo hide start
        this.generateCards();
        this.shuffleCards();
        this.placeCards();
    }

    private reset = (): void => {
        console.log('reset!')
    }

    private generateCards(): void {
        for (let i: number = 0; i < Game.numberOfPairs; i++) {
            const value: string = String(i + 1);

            const card1: Card = {
                value: value,
                revealed: false,
                solved: false,
                el: this.ui.createCard(value),
                timeoutHandler: null,
            }
            const card2: Card = {
                value: value,
                revealed: false,
                solved: false,
                otherCard: card1,
                el: this.ui.createCard(value),
                timeoutHandler: null,
            }
            card1.otherCard = card1;

            this.elementToCardMap.set(card1.el, card1);
            this.elementToCardMap.set(card2.el, card2);

            this.cards.push(card1);
            this.cards.push(card2);
        }
    }

    private shuffleCards(): void {
        for (let i: number = this.cards.length - 1; i > 0; i--) {
            const j: number = Math.floor((Math.random() * (i + 1)));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    private placeCards(): void {
        for (const card of this.cards) {
            this.ui.setClickHandler(card.el, this.cardClickHandler);
            this.ui.appendCard(card.el);
        }
    }

    private cardClickHandler = (e: Event): void => {
        const el = e.currentTarget as CardElement;
        const card: Card = this.elementToCardMap.get(el) as Card;

        if (card.solved || card === this.previousCard && card.revealed) {
            return;
        }

        this.revealCard(card);

        if (this.previousCard != null && this.previousCard.value == card.value) {
            this.disableTimedHiding(this.previousCard);

            card.solved = true;
            this.previousCard.solved = true;

            this.previousCard = null;
            this.revealedCount += 2;
        } else {
            this.previousCard = card;
            this.setTimeoutForHiding(card);
        }
    }

    private hideAgain = (card: Card): void => {
        card.revealed = false;
        card.timeoutHandler = null;

        this.ui.hide(card.el);

        this.previousCard = null;
    }

    private revealCard(card: Card): void {
        card.revealed = true;

        this.ui.reveal(card.el);
    }

    private disableTimedHiding(card: Card): void {
        this.dom.window.clearTimeout(Number(card.timeoutHandler));
    }

    private setTimeoutForHiding(card: Card): void {
        card.timeoutHandler = this.dom.window.setTimeout(() => {
            this.hideAgain(card);
        }, Game.cardRevealTimeoutMillisecond);
    }
}

export { Game, IGameDOM };