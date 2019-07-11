let Scene = require("telegraf/scenes/base");
let extractDomain = require("../../util/extract-domain");
let { getDefaultParser } = require("../../parser/parse-manager");
let to = require("await-to-js").default;



let createScene = (Scene, db) => {

    let parser = getDefaultParser();
    let scene = new Scene("add-wish");

    scene.enter(ctx => ctx.reply("Send me a link to an item or /cancel"));

    scene.command("cancel", ctx => ctx.scene.enter("main"));

    scene.on("message", async ctx => {
        let url = ctx.message.text.toLowerCase();
        let domain = extractDomain(url);
        
        if (!domain) {
            return ctx.reply("Not a link or shop is not supported");
        } 

        ctx.reply("Trying to retrieve item info...");  
        let [err, data] = await to(parser.getData(url));

        if (err) {
            return ctx.reply(err);
        }

        let { price, article, title } = data;

              
        db.wishes.addIfNotExists(ctx.message.from.id, url, price, article, title)
            .then(() => {
                ctx.reply(`Added: ${title}, ${price}, ${article}`).then(() =>
                    ctx.scene.enter("main"));
                
            })
            .catch(err => {
                // logger.error("add-wish-scene: " + err)
                ctx.reply(err);
            });
    });
    
    return scene;
};

module.exports = db => createScene(Scene, db);