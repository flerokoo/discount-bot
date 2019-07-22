jest.mock("../../src/parser/parse-manager");

let sinon = require("sinon");
let Messages = require("../../src/messages");
let Telegraf = require("../mocks/telegraf");
let { startBotFactory } = require("../../src/bot/index");
let EventEmitter = require("events").EventEmitter;



test("Bot listens to NOTIFY_USERS event", () => {
    let on = sinon.mock();
    startBotFactory(Telegraf)({ on }, null);
    expect(on.calledWith(Messages.NOTIFY_USERS)).toBe(true);
});

test("Bot updates last known prices after notifying users", () => new Promise(resolve => {
    let wishes = {
        getWithItemsData: () => Promise.resolve([{
            id: 2,
            user_id: 1,
            current_price: 12000,
            last_known_price: 15000,
            initial_price: 15000,
            title: "Some item"
        }]),
        batchUpdateLastKnownPrices: resolve
    };
    let emitter = new EventEmitter();
    startBotFactory(Telegraf)(emitter, { wishes })
    emitter.emit(Messages.NOTIFY_USERS);
}).then(prices => expect(prices).toEqual([{
    id: 2,
    price: 12000
}])));
