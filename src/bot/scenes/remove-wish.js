let Scene = require("telegraf/scenes/base")
let config = require("../../config");
let extractDomain = require("../../util/extract-domain");
let { getDefaultParser } = require("../../parser/parse-manager");
let logger = require("winston");
let to = require("await-to-js").default;



let createScene = (Scene, db) => {

    let scene = new Scene("remove-wish");

    scene.enter(ctx => {
        
        // db.items.get({user_id})
        db.wishes.getWithItemsDataByUserId(ctx.chat.id).then(data => {            
            if (!data || data.length <= 0) {
                ctx.reply("Nothing to delete, go /back to main menu")
            } else {
                let commands = data
                    .map(d => `${d.title}\n${d.url}\n/remove${d.id}`)
                    .join("\n\n")
                ctx.reply(commands + "\n\nor go /back")
            }
        }).catch(err => {
            ctx.reply("Can't fetch your items, try again later")
            ctx.scene.enter("main");
        })

        
    });

    scene.command("back", ctx => ctx.scene.enter("main"))

    scene.on("message", async ctx => {
        let text = ctx.message.text;

        let result = text.match(/remove([\d]+)/i);
        
        if (result) {
            let id = parseInt(result[1]);
            let [err, wishes] = await to(db.wishes.get({ user_id: ctx.chat.id, id }));
            
            if (err) {
                return ctx.reply("Can't remove item: " + err);
            }

            if (wishes.length > 0) {
                db.wishes.delete({ id })
                    .then(res => {
                        ctx.reply("Success!");
                        ctx.scene.enter("main")
                    })
                    .catch(err => {
                        ctx.reply("Something wrong: " + err);
                        ctx.scene.enter("main")
                    })
            }                 
        }

        // let url = ctx.message.text.toLowerCase();
        // let domain = extractDomain(url);
        
        // if (!domain) {
        //     return ctx.reply("Not a link or shop is not supported")
        // } 

        // ctx.reply("Trying to retrieve item info...")  
        // let [err, data] = await to(parser.getData(url));

        // if (err) {
        //     return ctx.reply(err);
        // }

        // let { price, article, title } = data;

              
        // db.wishes.addIfNotExists(ctx.message.from.id, url, price, article, title)
        //     .then(() => {
        //         ctx.reply(`Added: ${title}, ${price}, ${article}`).then(() =>
        //             ctx.scene.enter("main"))
                
        //     })
        //     .catch(err => {
        //         // logger.error("add-wish-scene: " + err)
        //         ctx.reply(err)
        //     });
    });
    
    return scene;
}

module.exports = db => createScene(Scene, db);