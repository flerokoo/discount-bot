let schedule = require("node-schedule");
let config = require("./config");
let { getDefaultParser } = require("./parser/parse-manager");
let { fromTimestamp } = require("./db/timestamp");
let moment = require("moment");
let Messages = require("./messages");

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
        return this;
    }

    stop() {
        
        if (this.rule) {
            this.rule.cancel();
            this.rule = null;
        }

        return this;
    }

    async runCycle() {    
        
        if (this.running) {
            return;
        }

        this.running = true;        
        let current = 0;
        let completed = 0;
        let slots = this.maxConcurrentTasks;
        let items = await this.db.items.get()        

        
        let finalize = () => {
            this.running = false;
            let data = items
                .filter(item => !!item.new_price)
                .map(item => ({ id: item.id, current_price: item.new_price }));
            
            data.length > 0 && this.db.items.batchUpdatePrices(data).then(() => {
                this.mediator.emit(Messages.NOTIFY_USERS, "ok")
            });
            
        }

        let onItemDataLoad = (price, article, title, item) => {
            
            console.log(`${item.title} prev price ${item.current_price} cur ${price}`)
            // console.log(item)
            // this.db.items.updatePriceById(item.id, price).then(() => null)
            item.new_price = price;
            // console.log(`slots=${slots} completed=${title}`)
            slots++;
            completed++;

            if (completed === items.length) {
                return finalize();
            }
            
            next();
        }

        // console.log(items)

        let next = () => {
            if (!this.running) return;            

            while (current < items.length && slots > 0) {                

                let item = items[current++];  
                
                if (moment().diff(fromTimestamp(item.updated_at)) < config.updateInterval) {
                    console.log("skipping " + item.title)
                    completed++;                    
                    if (completed === items.length) {
                        return finalize();
                    } else {
                        continue;
                    }
                }                    

                this.parser.getData(item.url)
                    .then(({ price, article, title }) => onItemDataLoad(price, article, title, item))
                    .catch(err => {
                        // TODO add log
                        console.error(err)
                    })
                
                slots--;
            }
        }

        next();
        
    }

    get totalRunningTasks() {
        if (!this.runningTasksAmounts) return 0;
        return Object.keys(this.runningTasks)
            .reduce((acc, key) => this.runningTasks[key] + acc, 0);
    }
}