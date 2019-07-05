let Scene = require("telegraf/scenes/base")
let config = require("../../config");
let Markup = require("telegraf/markup");
let Extra = require("telegraf/extra");


let mainMenuText = "Hey-yo! You are in main menu now."
let shopsText = mainMenuText + "\nHere's a list of supported shops:\n" + config.supportedShops.join("\n")

let mainMenuKeyboard = Markup.inlineKeyboard([
    Markup.callbackButton("Shops", "shops"),
    Markup.callbackButton("Add item", "add")
]).oneTime().resize().extra()

let createScene = Scene => {
    let scene = new Scene("main");
    scene.enter(ctx => {
        // ctx.reply("ye", Markup.keyboard(["Add item", "Remove item", "Shops"]).oneTime().resize().extra());
        ctx.reply(mainMenuText, mainMenuKeyboard);
    })

    scene.inlineQuery("Coke", console.log)
    

    scene.action("add", ctx => {
        ctx.scene.enter("add-wish")
    });

    scene.action("shops", ctx => ctx.editMessageText(shopsText, mainMenuKeyboard))

    // scene.hears("Add item", ctx => ctx.scene.enter("add-wish"))
    // scene.hears("Shops", ctx => ctx.reply(config.supportedShops.join("\n")))

    return scene;
}

module.exports = db => createScene(Scene, db);