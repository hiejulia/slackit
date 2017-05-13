'use strict';
//import real time mes client from slack api
const RtmClient = require('@slack/client').RtmClient;
//including rtm 
const MemoryDataStore = require('@slack/client').MemoryDataStore;
//import rtm events  constants from slack api
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//import client event const from slack api
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = 'xoxb-182470253664-BX6FLRWvCu33PNs2yWAkkJMP';

//slack constructor take 2 arg > token & opts
let slack = new RtmClient(token,{
    //set level of log we require
    logLevel: 'error',
    //init data store for client > load additional helper funcs for store and retrieve data

    dataStore: new MemoryDataStore(),
    //slack should auto reconnect after error res
    autoReconnect: true,
    //each mess > marked as read
    autoMark: true 
});

//get all the channels
//return all the channels
function getChannels(allChannels) {
    let channels = [];
    //loop over all the channels
    for(let id in allChannels){
        let channel = allChannels[id];
        //is this user a member of this channel
        if(channel.is_member){
            //if yes > push to array
            channels.push(channel);
        }
    }
    return channels;
}
//get all members 


//add event listener for rtm connection open event> called when bot connected to the channel> slack api can subscribe to the event using on  method
slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED,() => {
    console.log('connected !');
    //get user name
    let user = slack.dataStore.getUserById(slack.activeUserId);
    //get the team name
    let team = slack.dataStore.getTeamById(slack.activeTeamId);
    //log it out
    console.log(`Connected to ${team.name} as ${user.name}`);

//get all the channles 
let channels =  getChannels(slack.dataStore.channels);
//use array .map > loop over instance > return array of names of each channel > chain array.join>>convert the names  of each channel
let channelNames =channels.map((channel) => {
    return channel.name
}).join(', ');
console.log(channelNames);

//get all members of channel
channels.forEach((channel) => {
     console.log('Members of this channel: ', channel.members);//get all member of a channel
     //get user id 
     let members = channel.members.map((id) => {
         return slack.dataStore.getUserById(id);
     });
     

     //bot cannot talk to him > avoid> is_bot in the member obj
     //filter out the bot from member list
     members = members.filter((member) =>{
         return !member.is_bot;
     });//filter all member accept the bot 


     ////each member obj = > has name value
     let memberNames = members.map((member) => {
         return member.name
     }).join(', ');
     console.log('name of all members in the channel is '+memberNames);
//send greeting to everyone
slack.sendMessage(`Hello ${memberNames}!`, channel.id);
     
});//end get all channels







});//end listen to the open event

// //authenticated event > bot listen to 
// slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
//   console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
// });//end authenticated event

//listen for message event
slack.on(RTM_EVENTS.MESSAGE, (message) => {
  let user = slack.dataStore.getUserById(message.user)

  if (user && user.is_bot) {
    return;
  }

  let channel = slack.dataStore.getChannelGroupOrDMById(message.channel);

  if (message.text) {
    let msg = message.text.toLowerCase();

    if (/(hello|hi) (bot|awesomebot)/g.test(msg)) {
        //get the time
        let sentTime = Date.now();
//         setInterval(() => {
//     // Get the current timestamp
//     let currentTime = Date.now();
        
//     // Make sure we only allow a message once a full second has // passed 
//     if ((currentTime - sentTime) > 1000) {

//       slack.sendMesssage('Limiting my messages to 1 per second', channel.id);

//       // Set the new sentTime
//       sentTime = Date.now();
//     }
//   }, 100);

      slack.sendMessage(`Hello to you too, ${user.name}!`, channel.id);
    }
  }
});//end listen for message event


//listen for the dm event
slack.on(RTM_EVENTS.MESSAGE,(message) => {
    //get user id
    let user = slack.dataStore.getUserById(message.user)
    if (user && user.is_bot) {
    return;
  }

  let channel = slack.dataStore.getChannelGroupOrDMById(message.channel);//message from with channel
  if(message.text){
      let msg = message.text.toLowerCase();//to lowercase
      if(/uptime/g.test(msg)) {
        //   debugger;
          //get dm by name
          let dm = slack.dataStore.getDMByName(user.name);
          //let uptime 
          let uptime = process.uptime();
          //get the uptime time 
          let minutes = parseInt(uptime / 60, 10),
          hours = parseInt(minutes / 60, 10),
          seconds = parseInt(uptime - (minutes * 60) - ((hours * 60) * 60), 10);

          //send message back to the user 
          slack.sendMessage(`I have been running for: ${hours} hours, ${minutes} minutes and ${seconds} seconds.`, dm.id);

      }
  }


});//end listen for message event for DM event



// Start the login process
slack.start();