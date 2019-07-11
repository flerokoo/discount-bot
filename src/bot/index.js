let Telegraf = require("telegraf");
let session = require("telegraf/session");
let Stage = require("telegraf/stage");
let config = require("../config");
let Messages = require("../messages");
let logger = require("../util/logger");

let startBotFactory = Telegraf => (mediator, db) => {
    const bot = new Telegraf(config.botToken);

    const stage = new Stage();
    stage.register(require("./scenes/main")(db));
    stage.register(require("./scenes/add-wish")(db));
    stage.register(require("./scenes/remove-wish")(db));

    bot.use(session());
    bot.use(stage.middleware());
    
    bot.start(ctx => {
        ctx.scene.enter("main");
    });

    // bot.on("message", ctx => {
    //     console.log("ctx.message.from.id", ctx.message.from.id)
    //     console.log("ctx.from.id", ctx.from.id)
    //     console.log("ctx.chat.id", ctx.chat.id)
    //     setTimeout(() => {
    //         bot.telegram.sendMessage(ctx.message.from.id, "Some messg")
    //     }, 1000)
    // })
    
    mediator.on(Messages.NOTIFY_USERS, async () => {
        logger.info("Notifying users");
        mediator.emit(Messages.LOCK_CRAWLING);
        let data = await db.wishes.getWithItemsData();
        
        // move this to the moment after updating last known prices


        data.forEach(wish => {
            let user_id = parseInt(wish.user_id);
            let current = parseInt(wish.current_price);
            let last = parseInt(wish.last_known_price);
            let initial = parseInt(wish.initial_price);
            let title = wish.title;

            if (last > current) {
                bot.telegram.sendMessage(user_id, `${title} current price — ${current}, initial price — ${initial}`);
            }
        });

        let lastKnownPrices = data.map(i => ({ id: i.id, price: i.current_price }));
        await db.wishes.batchUpdateLastKnownPrices(lastKnownPrices);
        mediator.emit(Messages.UNLOCK_CRAWLING);
    });

    bot.startPolling();
    logger.info("Bot started");
};

module.exports = startBotFactory(Telegraf);