# Discount Bot

Send this Telegram bot a link to an item in one of supported shops and it will notify you when price drops. Currenly only following shops are supported: asos.com, lamoda.ru, street-beat.ru, sneakerhead.ru. Adding support for a new shop is as simple as writing one small async function.

Technology stack:
* Telegraf
* Puppeteer
* sqlite3
* Docker
* awilix

## Usage

```sh
docker build -t discount-bot .

docker run \
    --env BOT_TOKEN=your_bot_token \
    --shm-size 1G \
    --sysctl net.ipv6.conf.all.disable_ipv6=1 \
    --init \
    discount-bot
```




