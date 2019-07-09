let Scene = require("telegraf/scenes/base")
let config = require("../../config");
let Markup = require("telegraf/markup");
let Extra = require("telegraf/extra");


let mainMenuText = "Hey-yo! You are in main menu now."
let shopsText = mainMenuText + "\nHere's a list of supported shops:\n" + config.supportedShops.join("\n")

let mainMenuKeyboard = Markup.inlineKeyboard([
    [ 
        Markup.callbackButton("➖ Remove item", "remove"),
        Markup.callbackButton("➕ Add item", "add"),
    ],
    [
        Markup.callbackButton("🛒 Shops", "shops"),
    ],
    [
        Markup.callbackButton("📰 Items", "items"),
    ],
]).oneTime().resize().extra()

let createScene = (Scene, db) => {
    let scene = new Scene("main");
    scene.enter(ctx => {
        // ctx.reply("ye", Markup.keyboard(["Add item", "Remove item", "Shops"]).oneTime().resize().extra());
        ctx.reply(mainMenuText, mainMenuKeyboard);
    })

    scene.inlineQuery("Coke", console.log)
    

    scene.action("add", ctx => ctx.scene.enter("add-wish"));
    scene.action("remove", ctx => ctx.scene.enter("remove-wish"));

    scene.action("shops", ctx => ctx.editMessageText(shopsText, mainMenuKeyboard))
    scene.action("items", ctx => {
        // db.wishes.get({ user_id: ctx.chat.id }).then(result => {
        //     console.log(result)
        //     let text = result.map(i => `${i.title}\n${i.url}`).join("\n");
        //     ctx.editMessageText("Here's your wishlist:\n\n" + text);            
        // }).catch(err => {
        //     ctx.editMessageText("Can't get your wishlist, try later")
        // })

        db.wishes.getWithItemsDataByUserId(ctx.chat.id).then(data => {
            let text = data.map(i => `${i.title}\n${i.url}`).join("\n");
            ctx.editMessageText("Here's your wishlist:\n\n" + text, mainMenuKeyboard); 
        }).catch(err => {
            ctx.editMessageText("Can't get your wishlist, try later", mainMenuKeyboard)
        })
        
    });
    
    return scene;
}

module.exports = db => createScene(Scene, db);