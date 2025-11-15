
interface IGameDOM {
    window: Window,
    cards: HTMLDivElement,
    start: HTMLButtonElement,
    reset: HTMLButtonElement,
}

type Card = {
    pair: CardPair|null,
    el: HTMLDivElement,
}

type CardPair = {
    card1: Card,
    // pos1: number,
    card2: Card,
    // pos2: number,
}

type CardPairs = Map<string, CardPair>;

class Game {
    private dom: IGameDOM;
    private numberOfPairs: number = 5;
    private revealedCount: number = 0;
    private cardRevealTimeoutMillisecond: number = 3000;
    private previousCard: HTMLDivElement|null = null;

    public constructor(domInterface: IGameDOM) {
        this.dom = domInterface;

        this.init();
    }

    private init(): void {
        this.dom.start.addEventListener('click', this.start);
        this.dom.reset.addEventListener('click', this.reset);
    }

    private start = (): void => {
        // todo show reset
        // todo hide start
        const pairs: CardPairs = this.generatePairs(this.numberOfPairs);
        this.placeCards(pairs);
    }

    private reset = (): void => {
        console.log('reset!')
    }

    private generatePairs(numberOfPairs: number): CardPairs {
        const pairs: CardPairs = new Map();

        for (let i: number = 0; i < numberOfPairs; i++) {
            const card1 = {
                pair: null,
                el: this.generateCardHtml(String(i + 1)),
            }
            const card2 = {
                pair: null,
                el: this.generateCardHtml(String(i + 1)),
            }

            const pair: CardPair = {
                card1: card1,
                card2: card2,
            }

            pairs.set(String(i + 1), pair);
        }

        return pairs;
    }

    private generateCardHtml(text: string): HTMLDivElement {
        const card: HTMLDivElement = this.dom.window.document.createElement('div');
        card.innerHTML = text;
        card.dataset.value = text;
        card.dataset.revealed = 'no';
        card.classList.add('hide')

        return card;
    }

    private placeCards(pairs: CardPairs): void {
        let cards = new Array<Card>;

        pairs.forEach((pair: CardPair) => {
            cards.push(pair.card1);
            cards.push(pair.card2);
        });

        cards = this.shuffleCards(cards);

        for (const card of cards) {
            const el = card.el;
            el.addEventListener('click', this.clickHandler)

            this.dom.cards.appendChild(el);
        }
    }

    private clickHandler = (e: Event): void => {
        const el = e.currentTarget as HTMLDivElement;
        if (el.dataset.revealed == 'yes') {
            return;
        }
        console.log(`Clicked  ${el.dataset.value}!`);

        el.classList.remove('hide');

        console.log('---');
        console.log(this.previousCard);
        console.log(this.previousCard?.dataset.value);
        console.log(el.dataset.value);


        if (this.previousCard != null
            && this.previousCard.dataset.value == el.dataset.value) {
            window.clearTimeout(Number(this.previousCard.dataset.timeoutHandler));
            this.revealedCount += 2;

            if (this.revealedCount = 2 * this.numberOfPairs) {

            }
        } else {
            this.previousCard = el;
            el.dataset.revealed = 'yes';
            const timeoutHandler: number = this.dom.window.setTimeout(() => {
                this.hideAgain(el);
            }, this.cardRevealTimeoutMillisecond);

            el.dataset.timeoutHandler = String(timeoutHandler);
        }
    }

    private hideAgain = (el: HTMLDivElement): void => {
        el.classList.add('hide');
        el.dataset.revealed = 'no';
        this.previousCard = null;
    }

    private shuffleCards(cards: Array<Card>): Array<Card> {
        const arr = [...cards];
        for (let i: number = arr.length - 1; i > 0; i--) {
            const j: number = Math.floor((Math.random() * (i + 1)));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr;
    }
}

export { Game, IGameDOM };