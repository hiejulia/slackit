'use strict';
//import real time mes client from slack api
const RtmClient = require('@slack/client').RtmClient;
//including rtm 
const MemoryDataStore = require('@slack/client').MemoryDataStore;
//import rtm events  constants from slack api
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//import client event const from slack api
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = '';

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


//add event listener for rtm connection open event> called when bot connected to the channel> slack api can subscribe to the event using on  method
slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED,() => {
    console.log('connected !');
    //get user name
    let user = slack.dataStore.getUserById(slack.activeUserId);
    //get the team name
    let team = slack.dataStore.getTeamById(slack.activeTeamId);
    //log it out
    console.log(`Connected to ${team.name} as ${user.name}`);

});
// Start the login process
slack.start();