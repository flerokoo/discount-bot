let Telegraf = require("telegraf");
let session = require("telegraf/session");
let Stage = require("telegraf/stage");
let config = require("../config");
let Messages = require("../messages");
let logger = require("../util/logger");

let startBot = ({
    Telegraf,
    Stage,
    Scene,
    mediator,
    db,
    registerScenes
}) => {

    const bot = new Telegraf(config.botToken);

    const stage = new Stage();
    registerScenes(stage, db, Scene);

    bot.use(session());
    bot.use(stage.middleware());
    
    bot.start(ctx => {
        ctx.scene.enter("main");
    });
    
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

module.exports = startBot