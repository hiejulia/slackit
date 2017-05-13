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
})





});//end listen to the open event





// Start the login process
slack.start();