let Scene = require("telegraf/scenes/base")
let config = require("../../config");

let createScene = Scene => {
    let scene = new Scene("main");
    scene.enter(ctx => ctx.reply(`
        /add new item
        /remove some items
        /show all items
        /shops 
    `))
    scene.command("add", ctx => ctx.scene.enter("add-wish"))
    scene.command("shops", ctx => ctx.reply(config.supportedShops.join("\n")))

    return scene;
}

module.exports = db => createScene(Scene, db);