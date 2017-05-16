'use strict';
const WEBHOOK_URL = process.env.WEBHOOK_URL;


const request = require('superagent');

request
  .post(WEBHOOK_URL)
  .send({
    username: "Incoming webhook bot",
    icon_emoji: ":+1:",
    text: 'Hello! Here is a fun link: <http://www.github.com|Github is great!>'
  })
  .end((err, res) => {
    console.log(res);
  });
