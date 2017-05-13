'use strict';
//import all slack client
const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

//class Bot
class Bot {
    constructor(opts) {
        let slackToken = opts.token;
        //autoreconnect
        let autoReconnect = opts.autoReconnect || true;

        //automark
        let autoMark = opts.autoMark || true;
        this.slack = new RtmClient(slackToken, {

            logLevel: 'error',

            dataStore: new MemoryDataStore(),

            autoReconnect: autoReconnect,
            autoMark: autoMark
        });
//
// Create an ES6 Map to store our regular expressions
this.keywords = new Map();

        //start listening the event
        this.slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      let user = this.slack.dataStore.getUserById(this.slack.activeUserId)
      let team = this.slack.dataStore.getTeamById(this.slack.activeTeamId);

      this.name = user.name;

      console.log(`Connected to ${team.name} as ${user.name}`);      
    });
    
//listen to the event
this.slack.on(RTM_EVENTS.MESSAGE, (message) => {
  // Only process text messages
  if (!message.text) {
    return;
  }

  let channel = this.slack.dataStore.getChannelGroupOrDMById(message.channel);
  let user = this.slack.dataStore.getUserById(message.user);

  // Loop over the keys of the keywords Map object and test each
  // regular expression against the message's text property
  for (let regex of this.keywords.keys()) {    
    if (regex.test(message.text)) {
      let callback = this.keywords.get(regex);
      callback(message, channel, user);
    }
  }
});





    this.slack.start();
  }

//

respondsTo(){
    if (/(hello|hi) (bot|awesomebot)/g.test(msg)) {
  // do stuff...
}

if (/uptime/g.test(msg)) {
  // do more stuff...
}
}



}

//exports Bot
module.exports = Bot;