let Scene = require("telegraf/scenes/base")
let config = require("../../config");
let extractDomain = require("../../util/extract-domain");
let { getDefaultParser } = require("../../parser/parse-manager");
let logger = require("winston");
let to = require("await-to-js").default;



let createScene = (Scene, db) => {

    let parser = getDefaultParser();
    let scene = new Scene("add-wish");

    scene.enter(ctx => ctx.reply("Send me a link to an item or /cancel"))

    scene.command("cancel", ctx => ctx.scene.enter("main"))

    scene.on("message", async ctx => {
        let text = ctx.message.text.toLowerCase();
        let domain = extractDomain(text);

        
        if (!domain) {
            return ctx.reply("Not a link or shop is not supported")
        } 

        let [err, data] = await to(parser.getData(text));

        if (err) {
            return ctx.reply(err);
        }

        let { price, article, title } = data;
        
        db.addWish(ctx.message.from.id, text, price, article, title)
            .then(() => ctx.reply(`Added: ${title}, ${price}, ${article}`))
            .catch(err => {
                // logger.error("add-wish-scene: " + err)
                ctx.reply(err)
            });
        
        // console.log("START")
        // db.addWishByUrl(ctx.message.from.id, text)
        //     .then( ()=>ctx.reply("added"))
        //     .then(db.getWishes)
        //     .then(wishes => ctx.reply(JSON.stringify(wishes)))
        //     .catch(ctx.reply)
    })
    
    return scene;
}

module.exports = db => createScene(Scene, db);