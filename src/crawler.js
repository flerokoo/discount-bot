let schedule = require("node-schedule");
let config = require("./config");
let { getDefaultParser } = require("./parser/parse-manager");

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
        this.rule = schedule.scheduleJob("*/30 * * * * *", () => this.runCycle())
        this.rule.invoke();
        this.running = true;
    }

    stop() {
        if (this.rule) {
            this.rule.cancel();
            this.rule = null;
        }
    }

    runCycle() {          
        this.db.getItems().then(items => {
            
            let current = 0;
            let slots = this.maxConcurrentTasks;

            let onComplete = (price, article, item) => {
                slots++;
                console.log(`prev price ${item.currentprice} cur ${price}`)
                next();
            }

            let next = () => {
                if (!this.running) return;

                while (slots > 0 && current < items.length) {
                    let item = items[current++];   
                    console.log(item)
                    this.parser.getData(item.url)
                        .then(({price, article}) => onComplete(price, article, item) )
                        .catch(err => {
                            // TODO add log
                            console.error(err)
                        })
                    slots--;
                }   
            }

            next();
        })


        let onComplete = () => {            
            if (!this.running) return;

            let totalRunning = this.totalRunningTasks;

            while (totalRunning < this.maxConcurrentTasks) {
                
            }
        }
    }

    get totalRunningTasks() {
        if (!this.runningTasksAmounts) return 0;
        return Object.keys(this.runningTasks)
            .reduce((acc, key) => this.runningTasks[key] + acc, 0);
    }
}