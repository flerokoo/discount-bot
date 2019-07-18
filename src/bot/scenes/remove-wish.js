let Scene = require("telegraf/scenes/base");
let to = require("await-to-js").default;
let logger = require("../../util/logger");



let createScene = ({ Scene, db }) => {

    let scene = new Scene("remove-wish");

    scene.enter(ctx => {
        db.wishes.getWithItemsData({ "wishes.user_id": ctx.chat.id }).then(data => {            
            console.log(data);
            if (!data || data.length <= 0) {
                ctx.reply("Nothing to delete, go /back to main menu");
            } else {
                let commands = data
                    .map(d => `${d.title}\n${d.url}\n/remove${d.id}`)
                    .join("\n\n");
                ctx.reply(commands + "\n\nor go /back");
            }
        }).catch(err => {
            logger.error("Remove-wish scene: cant send list of items: " + err);
            ctx.reply("Can't fetch your items, try again later");
            ctx.scene.enter("main");
        });
    });

    scene.command("back", ctx => ctx.scene.enter("main"));

    scene.on("message", async ctx => {
        let text = ctx.message.text;

        let result = text.match(/remove([\d]+)/i);
        
        if (!result) {
            return;
        }

        let id = parseInt(result[1]);
        let [err, wishes] = await to(db.wishes.get({ user_id: ctx.chat.id, id }));
        
        if (err) {
            return ctx.reply("Can't remove item: " + err);
        }

        if (wishes.length <= 0) {
            return;
        }

        db.wishes.delete({ id })
            .then(() => {
                ctx.reply("Success!");
                ctx.scene.enter("main");
            })
            .catch(err => {
                ctx.reply("Something wrong: " + err);
                ctx.scene.enter("main");
            });

    });
    
    return scene;
};

module.exports = createScene;