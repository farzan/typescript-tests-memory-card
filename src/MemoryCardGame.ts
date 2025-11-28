import { type CardElement, type IUI, uiFactory, type IGameDOM } from "./UI"

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

type GameCallbacks = {
    winCallback: () => void,
}

class Game {
    private static readonly numberOfPairs: number = 3;
    private static readonly cardRevealTimeoutMillisecond: number = 3000;

    private dom: IGameDOM;
    private startTime!: number;
    private timerIntervalHandler!: number;

    private ui!: IUI;

    public constructor(dom: IGameDOM) {
        this.dom = dom;

        this.ui = uiFactory(this.dom);

        this.dom.start.addEventListener('click', this.start);
    }

    private start = (): void => {
        new Round(
            this.dom,
            this.ui,
            {
                numberOfPairs: Game.numberOfPairs,
                cardRevealTimeoutMillisecond: Game.cardRevealTimeoutMillisecond,
            },
            {
                winCallback: this.winCallback,
            }
        );

        this.startTimer();
    }

    private startTimer(): void {
        this.startTime = Date.now();
        this.timerIntervalHandler = this.dom.window.setInterval(this.displayTime, 1000);
    }

    private displayTime = (): void => {
        const seconds: number = Math.round((Date.now() - Number(this.startTime)) / 1000);
        this.ui.updateTimer(seconds);
    }

    private winCallback = (): void => {
        this.dom.window.clearInterval(this.timerIntervalHandler)
        this.ui.showApplause();
    }
}

type RoundSettings = {
    numberOfPairs: number,
    cardRevealTimeoutMillisecond: number,
}

class Round {
    private dom: IGameDOM;
    private ui: IUI;
    private roundSettings: RoundSettings;
    private gameCallbacks: GameCallbacks;

    private revealedCount: number = 0;
    private previousCard: Card|null = null;
    private cards: Cards = [];

    private elementToCardMap!: ElementToCardMap;

    public constructor(
        dom: IGameDOM,
        ui: IUI,
        roundSettings: RoundSettings,
        gameCallbacks: GameCallbacks,
    ) {
        this.dom = dom;
        this.ui = ui,
        this.roundSettings = roundSettings;
        this.gameCallbacks = gameCallbacks;

        this.init();
    }

    private init(): void {
        this.elementToCardMap = new WeakMap;

        this.generateCards();
        this.shuffleCards();
        this.placeCards();
    }

    private generateCards(): void {
        for (let i: number = 0; i < this.roundSettings.numberOfPairs; i++) {
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

            if (this.revealedCount === this.roundSettings.numberOfPairs * 2) {
                this.win();
            }
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
        }, this.roundSettings.cardRevealTimeoutMillisecond);
    }

    private win(): void {
        this.gameCallbacks.winCallback();
    }
}

export { Game, IGameDOM };