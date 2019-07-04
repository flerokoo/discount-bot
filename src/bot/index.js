let Telegraf = require("telegraf");
let session = require("telegraf/session");
let Stage = require("telegraf/stage")
let Scene = require("telegraf/scenes/base")
let Markup = require("telegraf/markup")
let config = require("../config");


let startBotFactory = Telegraf => (mediator, db) => {
    console.log("STARTINIG BOT")
    console.log(config.botToken)
    const bot = new Telegraf(config.botToken);

    const stage = new Stage();
    stage.register(require("./scenes/main")(db))
    stage.register(require("./scenes/add-wish")(db))

    bot.use(session())
    bot.use(stage.middleware())
    
    bot.start(ctx => {
        ctx.reply("Hello!")
        ctx.scene.enter("main")
    })

    bot.startPolling();
}

module.exports = startBotFactory(Telegraf);