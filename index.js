'use strict';

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = 'xoxb-183209869122-rDtl4MlNmAnJdnbbqWdELySV';
/**
 * INIT SLACK
 */
let slack = new RtmClient(token, {
  
  logLevel: 'error', 
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true 
});

/**
 * LISTENING FOR CONNECTED OPEN
 */
slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {

  let user = slack.dataStore.getUserById(slack.activeUserId);//get user 
  let team = slack.dataStore.getTeamById(slack.activeTeamId);//get team
  console.log(`Connected to ${team.name} as ${user.name}`);
  let channels = getChannels(slack.dataStore.channels);//get list of channels
  let channelNames = channels.map((channel) => {
    return channel.name;
  }).join(', ');

  console.log(`Currently in: ${channelNames}`)

  
  channels.forEach((channel) => {
    
    let members = channel.members.map((id) => {
      return slack.dataStore.getUserById(id);
    });

    
    members = members.filter((member) => {
      return !member.is_bot;
    });
    let memberNames = members.map((member) => {
      return member.name;
    }).join(', ');

    console.log('Members of this channel: ', memberNames);//get member of this channel
  });
});

/**
 * LISTENING FOR AUTHENTICATED EVENT
 */
// slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
//   console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
// });
/**
 * LISTENING FOR MESSAGE EVENT
 */
slack.on(RTM_EVENTS.MESSAGE, (message) => {
  let user = slack.dataStore.getUserById(message.user)

  if (user && user.is_bot) {
    return;
  }

  let channel = slack.dataStore.getChannelGroupOrDMById(message.channel);

  console.log(channel.id);
  slack.sendMessage('Hello!', channel.id, (err, msg) => {
    console.log('ret:', err, msg);
  });

  if (message.text) {
    let msg = message.text.toLowerCase();

    if (/uptime/g.test(msg)) {
      debugger;

      if (!user.is_admin) {        
        slack.sendMessage(`Sorry ${user.name}, but that functionality is only for admins.`, channel.id);
        return;
      } 

      let dm = slack.dataStore.getDMByName(user.name);

      let uptime = process.uptime();

      // get the uptime in hours, minutes and seconds
      let minutes = parseInt(uptime / 60, 10),
          hours = parseInt(minutes / 60, 10),
          seconds = parseInt(uptime - (minutes * 60) - ((hours * 60) * 60), 10);

      slack.sendMessage(`I have been running for: ${hours} hours, ${minutes} minutes and ${seconds} seconds.`, dm.id);
    }

    if (/(hello|hi) (bot|awesomebot)/g.test(msg)) {
      
      // The sent message is also of the 'message' object type
      slack.sendMessage(`Hello to you too, ${user.name}!`, channel.id, (err, msg) => {
        console.log('stuff:', err, msg);
      });
    }
  }
});






/**
 * FUNCTIONS 
 */

// Returns an array of all the channels the bot resides in
function getChannels(allChannels) {
  let channels = [];

  // Loop over all channels
  for (let id in allChannels) {
    // Get an individual channel
    let channel = allChannels[id];

    // Is this user a member of the channel?
    if (channel.is_member) {
      // If so, push it to the array
      channels.push(channel);
    }
  }

  return channels;
}


// Start the login process
slack.start();