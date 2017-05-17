'use strict';

/**
 * @import
 */
const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
/**
 * @Bot class
 */

class Bot {
  constructor(opts) {
    let slackToken = opts.token; //token
    let autoReconnect = opts.autoReconnect || true;
    let autoMark = opts.autoMark || true;

    this.slack = new RtmClient(slackToken, {
      logLevel: 'error',
      dataStore: new MemoryDataStore(),
      autoReconnect: autoReconnect,
      autoMark: autoMark
    });
    /**
 * @LISTEN FOR OPEN EVENT
 */
    this
      .slack
      .on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        // console.log(this.slack.dataStore);
        let user = this
          .slack
          .dataStore
          .getUserById(this.slack.activeUserId)
        let team = this
          .slack
          .dataStore
          .getTeamById(this.slack.activeTeamId)

        this.name = user.name;
        this.id = user.id; //add user id

        console.log(`Connected to ${team.name} as ${user.name}`);
      });

    this.keywords = new Map();

    /**
     * @LISTEN FOR MESSAGE EVENT
     */

    this
      .slack
      .on(RTM_EVENTS.MESSAGE, (message) => {
        // Only process text messages
        if (!message.text) {
          return;
        }
        //GET THIS CHANNEL AND USER
        let channel = this
          .slack
          .dataStore
          .getChannelGroupOrDMById(message.channel);
        let user = this
          .slack
          .dataStore
          .getUserById(message.user);

        // Loop over the keys of the keywords Map object and test each regular
        // expression against the message's text property
        for (let regex of this.keywords.keys()) {
          if (regex.test(message.text)) {
            let callback = this
              .keywords
              .get(regex);
            callback(message, channel, user);
          }
        }
      });

    this
      .slack
      .start();
  }

  // Send a message to a channel, with an optional callback
  send(message, channel, cb) {
    this
      .slack
      .sendMessage(message, channel.id, () => {
        if (cb) {
          cb();
        }
      });
  }

  // Return the name of the bot
  getName() {
    return this.name;
  }
  //set typing indicator
  setTypingIndicator(channel) {
    this
      .slack
      .send({type: 'typing', channel: channel.id});
  }

  getMembersByChannel(channel) {
    // If the channel has no members then that means we're in a DM
    if (!channel.members) {
      return false;
    }

    // Only select members which are active and not a bot
    let members = channel
      .members
      .filter((member) => {
        let m = this
          .slack
          .dataStore
          .getUserById(member);
        // Make sure the member is active (i.e. not set to 'away' status)
        return (m.presence === 'active' && !m.is_bot);
      });

    // Get the names of the members
    members = members.map((member) => {
      return this
        .slack
        .dataStore
        .getUserById(member)
        .name;
    });

    return members;
  }
  /**
 *
 *response to
 */
  respondTo(opts, callback, start) {
    if (!this.id) {
      // if this.id doesn't exist, wait for slack to connect before continuing
      this
        .slack
        .on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
          createRegex(this.id, this.keywords);
        });
    } else {
      createRegex(this.id, this.keywords);
    }

    function createRegex(id, keywords) {

      if (opts === Object(opts)) {
        opts = {
          mention: opts.mention || false,
          keywords: opts.keywords || '',
          start: start || false
        };
      } else {
        opts = {
          mention: false,
          keywords: opts,
          start: start || false
        };
      }

      if (opts.mention) {

        opts.keywords = `<@${id}>:* ${opts.keywords}`;
      } else {

        opts.keywords = start
          ? '^' + opts.keywords
          : opts.keywords;
      }

      let regex = new RegExp(opts.keywords, 'i');

      // Set the regular expression to be the key, with the callback function as the
      // value
      keywords.set(regex, callback);
    }
  }
}

module.exports = Bot;