'use strict';
var Bot = require('slackbots'); 
var settings = { 
    token: 'API TOKEN', 
    name: 'quotebot' 
}; 
 
var bot = new Bot(settings); 

bot.on('start',function(){
    bot.postMessageToChannel('general', 'Hi channel.'); 
    bot.postMessageToUser('radkiddo', 'Hi user.'); 
    bot.postMessageToGroup('tisdoksend', 'Hi private group.');
})