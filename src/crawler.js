let schedule = require("node-schedule");
let config = require("./config");
let { getDefaultParser } = require("./parser/parse-manager");
let { fromTimestamp } = require("./db/timestamp");
let moment = require("moment");

module.exports = class Crawler {
    constructor(mediator, db) {
        this.mediator = mediator;
        this.db = db;
        
        this.maxConcurrentTasks = 10;

        this.rule = null;
        this.running = false;

        this.parser = getDefaultParser();

        this.runningTasksAmounts = null;
        this.tasksToRun = [];
    }

    start() {
        this.runningTasksAmounts = {};
        this.rule = schedule.scheduleJob("*/10 * * * * *", () => this.runCycle())
        this.rule.invoke();
    }

    stop() {
        if (this.rule) {
            this.rule.cancel();
            this.rule = null;
        }
    }

    runCycle() {    
        
        if (this.running) {
            return;
        }

        this.running = true;
        
        this.db.getItems().then(items => {
        
            let current = 0;
            let slots = this.maxConcurrentTasks;

            let onComplete = (price, article, item) => {
                slots++;
                console.log(`${item.id} prev price ${item.current_price} cur ${price}`)
                console.log(item)
                this.db.updatePriceById(item.id, price).then(() => null)
                next();
            }

            let next = () => {
                if (!this.running) return;

                if (current === items.length) {
                    return this.running = false;
                }

                while (current < items.length && slots > 0) {
                    let item = items[current++];  
                    
                    if (moment().diff(fromTimestamp(item.updated_at)) < config.updateInterval) {
                        console.log("skipping " + item.id)
                        continue;
                    }

                    this.parser.getData(item.url)
                        .then(({ price, article }) => onComplete(price, article, item))
                        .catch(err => {
                            // TODO add log
                            console.error(err)
                        })
                    slots--;
                }
            }

            next();
        })
    }

    get totalRunningTasks() {
        if (!this.runningTasksAmounts) return 0;
        return Object.keys(this.runningTasks)
            .reduce((acc, key) => this.runningTasks[key] + acc, 0);
    }
}