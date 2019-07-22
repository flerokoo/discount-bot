module.exports = class TelegrafMock {
    constructor() {
        this.telegram = {
            sendMessage: () => { }
        };
    }
    
    startPolling() { }
    use() { }
    start() { }
}