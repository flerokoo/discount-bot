FROM node:slim

RUN groupadd -r pptruser \
    && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app \
    && chown -R pptruser:pptruser /app

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY package.json .
RUN npm i --production

RUN mkdir logs/
RUN mkdir db/

# VOLUME db/
# VOLUME logs/

# ENV PUPPETEER_EXECUTABLE_PATH /usr/local/share/.config/yarn/global/node_modules/puppeteer/.local-chromium/linux-571375/chrome-linux/chrome
ENV NODE_ENV development
ENV BOT_TOKEN your_bot_token_here

COPY . .

RUN chmod 777 -R /app/db 

USER pptruser


CMD ["node", "src/index"]



