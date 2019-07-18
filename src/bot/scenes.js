module.exports = (stage, db, Scene) => {
    
    stage.register(require("./scenes/main")({ Scene, db }));
    stage.register(require("./scenes/add-wish")({ Scene, db }));
    stage.register(require("./scenes/remove-wish")({ Scene, db }));
}