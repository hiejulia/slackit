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
    logLevel: 'debug', 
    //init data store for client > load additional helper funcs for store and retrieve data

    dataStore: new MemoryDataStore(),
    //slack should auto reconnect after error res
    autoReconnect: true,
    //each mess > marked as read
    autoMark: true 
});

