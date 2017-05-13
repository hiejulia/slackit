'use strict';
//import real time mes client from slack api
const RtmClient = require('@slack/client').RtmClient;
//including rtm 
const MemoryDataStore = require('@slack/client').MemoryDataStore;
//import rtm events  constants from slack api
const RTM_EVENTS = require('@slack/client').RTM_EVENTS

