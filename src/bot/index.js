let Telegraf = require("telegraf");
let session = require("telegraf/session");
let Stage = require("telegraf/stage")
let Scene = require("telegraf/scenes/base")
let Markup = require("telegraf/markup")
let config = require("../config");
let Messages = require("../messages");

let startBotFactory = Telegraf => (mediator, db) => {
    const bot = new Telegraf(config.botToken);

    const stage = new Stage();
    stage.register(require("./scenes/main")(db))
    stage.register(require("./scenes/add-wish")(db))
    stage.register(require("./scenes/remove-wish")(db))

    bot.use(session())
    bot.use(stage.middleware())
    
    bot.start(ctx => {
        ctx.scene.enter("main")
    })

    // bot.on("message", ctx => {
    //     console.log("ctx.message.from.id", ctx.message.from.id)
    //     console.log("ctx.from.id", ctx.from.id)
    //     console.log("ctx.chat.id", ctx.chat.id)
    //     setTimeout(() => {
    //         bot.telegram.sendMessage(ctx.message.from.id, "Some messg")
    //     }, 1000)
    // })
    
    mediator.on(Messages.NOTIFY_USERS, async () => {
        let [items, wishes] = await Promise.all([db.items.get(), db.wishes.get()]);
        let itemsMap = items.reduce((acc, item) => (acc[item.url] = item, acc), {});
        
        wishes.forEach(wish => {
            let item = itemsMap[wish.url];
            let current = parseInt(item.current_price);
            let last = parseInt(wish.last_known_price)
            let initial = parseInt(item.initial_price)
            if (last > current) {
                bot.telegram.sendMessage(wish.user_id, `${item.title} current price — ${current}, initial price — ${initial}`)
            }
        })
        // TODO update last known prices
    });

    bot.startPolling();
}

module.exports = startBotFactory(Telegraf);