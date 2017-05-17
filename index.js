'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();
const redis = require('redis');
const Bot = require('./Bot');
const Botkit = require('botkit');
const os = require('os');
const request = require('superagent');
// import the natural library
const natural = require('natural');
const sentiment = require('sentiment');
// classifier const classifier = new natural.BayesClassifier();
// classifier.train(); classifier.save('classifier.json', (err, classifier) => {
//   // the classifier is saved to the classifier.json file! // }); const
// mongojs = require('mongojs'); const db =
// mongojs('127.0.0.1:27017/BotDB',['ReferenceDocuments']);

/**
 * TOKENIZER
 */
// initalize the tokenizer
const tokenizer = new natural.WordTokenizer();
// initialize the stemmer
const stemmer = natural.PorterStemmer;

stemmer.attach();
//SETUP INFLECTOR
const inflectorNount = new natural.NounInflector();
// console.log(inflector.pluralize('students'));
// console.log(inflector.singularize('student'));

const inflectorCount = natural.CountInflector;

/**
 * wolfram token declare
 */
const WOLFRAM_TOKEN = 'T8PVE4-277RJ5UK43';
const Client = require('node-wolfram');
const wolfram = new Client(WOLFRAM_TOKEN);
//API wiki
const wikiAPI = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintr" +
    "o=&explaintext=&titles="
const wikiURL = 'https://en.wikipedia.org/wiki/';

const youtubeAPI = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyDNHj6cNd3SATEpuS-TGxEgWg9" +
    "m9L42SmA&part=snippet&maxResults:1&q="
const youtubeURL = "https://www.youtube.com/watch?v="
const youtubesearchAPI = 'http://lamoscar-official.com/you/index.php?key=';

//google custom search
const googlesearchURL = 'https://www.google.fi/search?q=';

const mathjs = 'http://api.mathjs.org/v1/';

const client = redis.createClient();

/**
 * BOT
 */
const bot = new Bot({token: 'xoxb-184807119189-mGVowUqVY7s55cMrZBj69G2S', autoReconnect: true, autoMark: true});
//test redis
client.on('error', (err) => {
  console.log('Error ' + err);
});
//connect to redis
client.on('connect', () => {
  console.log('Connected to Redis!');
});

// Take the message text and return the arguments
function getArgs(msg) {
  return msg
    .split(' ')
    .slice(1);
}

/**
 * WOLFRAM QUERY
 *
 */
//from query search

/**
 * WIKI API ADD
 */
function getWiki(term, cb) { //get term
  // replace spaces with unicode
  let parameters = term.replace(/ /g, '%20');
  //call superagent
  request.get(wikiAPI + parameters) //api+q
    .end((err, response) => {
    if (err) {
      cb(err);
      return; //return nothing

    }
    //ok
    let url = wikiURL + parameters;
    cb(null, JSON.parse(response.text), url); //send response text + url

  });

}

//youtube call
function getYoutube(term, cb) { //get term

  let parameters = term.replace(/ /g, '%20');

  request
    .get(youtubeAPI + parameters)
    .end((err, response) => {
      if (err) {
        cb(err);
        return;

      }
      //ok
      let url = youtubeURL + parameters;
      cb(null, JSON.parse(response.text), url); //send response text + url

    });

}

//google search custom
function getGoogle(term, cb) { //get term

  let parameters = term.replace(/ /g, '%20');

  let url = googleURL + parameters;
  return url;

}



function stringifyNestedObjects(obj) {
  for (let k in obj) {
    if (obj[k]instanceof Object) {
      obj[k] = JSON.stringify(obj[k]);
    }
  }

  return obj;
}

function parseNestedObjects(obj) {
  for (let k in obj) {
    if (typeof obj[k] === 'string' || obj[k]instanceof String) {
      try {
        obj[k] = JSON.parse(obj[k]);
      } catch (e) {
        // string wasn't a stringified object, so fail silently
      }
    }
  }

  return obj;
}
bot.respondTo('', (message, channel, user) => {

  let tokenizedMessage = tokenizer.tokenize(message.text);

  // bot.send(`Tokenized message: ${JSON.stringify(tokenizedMessage)}`, channel);

  if (JSON.stringify(tokenizedMessage).indexOf("hello") > -1) {
    bot.send(`Hello ${user.name}`, channel);

  }

  if (JSON.stringify(tokenizedMessage).indexOf("bye") > -1) {

    bot.send(`Bye ${user.name}`, channel);

  }

  if (JSON.stringify(tokenizedMessage).indexOf("hey") > -1) {
    bot.send(`Yes ${user.name}, what's up?`, channel)

  }

  if (JSON.stringify(tokenizedMessage).indexOf("thanks") > -1) {
    bot.send(`You are welcome ${user.name} :)`, channel)

  }

  //youtube > handle error
  let commandyoutube = message.text;

  let distance = natural.LevenshteinDistance('youtube', commandyoutube);

  let tolerance = 2;

  //get youtube
  if (distance <= tolerance) {
    bot.send(`Looks like you were trying to get the youtube search, ${user.name}. Try with youtube command!`, channel);
  }

  let distance1 = natural.LevenshteinDistance('wiki', commandyoutube);
  //get wiki
  if (distance1 <= tolerance) {
    bot.send(`Looks like you were trying to get the wiki search, ${user.name}. Try with wiki command!`, channel);
  }

  let distance2 = natural.LevenshteinDistance('google', commandyoutube);
  //get wiki
  if (distance2 <= tolerance) {
    bot.send(`Looks like you were trying to get the google search, ${user.name}. Try with google command!`, channel);
  }

  let distance3 = natural.LevenshteinDistance('wolfram', commandyoutube);
  //get wiki
  if (distance3 <= tolerance) {
    bot.send(`Looks like you were trying to get the wolfram search, ${user.name}. Try with wolfram command!`, channel);
  }

});

bot.respondTo('how are you', (message, channel, user) => {
  bot.send(`I am fine. Thanks.And you, ${user.name} ?`, channel)
})



bot.respondTo({
  mention: true
}, (message, channel, user) => {
  let args = getArgs(message.text);

  let city = args.join(' ');

  getWeather(city, (error, fullName, description, temperature) => {
    if (error) {
      bot.send(error.message, channel);
      return;
    }
    bot.send('ok', channel);
    // bot.send(`The weather for ${fullName} is ${description} with a temperature of
    // ${Math.round(temperature)} celsius.`, channel);
  });
});

/**
 * inflectorCount
 */
bot.respondTo('what day is it', (message, channel) => {
  let date = new Date();

  // use the ECMAScript Internationalization API to convert month numbers into
  // names
  let locale = 'en-us';
  let month = date.toLocaleString(locale, {month: 'long'});
  bot.send(`It is the ${inflectorCount.nth(date.getDate())} of ${month}.`, channel);
}, true);

bot.respondTo('github', (message, channel, user) => {
  request
    .post(WEBHOOK_URL)
    .send({username: "Incoming bot", channel: "#general", icon_emoji: ":+1:", text: 'Hello! Here is a fun link: <http://www.github.com|Github is great!>'})
    .end((err, res) => {
      console.log(res);
    });
})

//uptime
bot.respondTo('timetillnow', (message, channel, user) => {
  let uptime = process.uptime();

  // get the uptime in hours, minutes and seconds
  let minutes = parseInt(uptime / 60, 10),
    hours = parseInt(minutes / 60, 10),
    seconds = parseInt(uptime - (minutes * 60) - ((hours * 60) * 60), 10);

  bot.send(`I have been running for: ${hours} hours, ${minutes} minutes and ${seconds} seconds.`, channel);
})
/**
 * WOLFRAM SEARCH
 */
bot.respondTo('help with wolfram', (message, channel, user) => {
  bot.send(`To use my Wolfram functionality, type \`wolfram\` followed by your search query`, channel);
})

bot.respondTo('wolfram', (message, channel, user) => {
  //check not bot
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message
    .text
    .split(' ')
    .slice(1)
    .join(' ');
  //if no args > return nothing

  if (args.length < 1) {
    bot.send(`You need to provide a search query first ${user.name}!`, channel);
    return;
  }
  //typing indicator

  wolfram
    .query(args, function (err, result) {
      bot.setTypingIndicator(message.channel);
      if (err) 
        console.log(err);
      else {
        for (var a = 0; a < result.queryresult.pod.length; a++) {
          var pod = result.queryresult.pod[a];
          console.log(pod.$.title, ": ");
          for (var b = 0; b < pod.subpod.length; b++) {
            var subpod = pod.subpod[b];
            for (var c = 0; c < subpod.plaintext.length; c++) {
              var text = subpod.plaintext[c];
              console.log('\t', text);
              bot.send(`${text}`, channel);
            }
          }
        }
      }
    });

}, true);

/**
 * WIKI API
 *
 */
bot.respondTo('help with wiki', (message, channel, user) => {
  bot.send(`To use my Wikipedia functionality, type \`wiki\` followed by your search query`, channel);
})
/**
 * wiki
 */
bot.respondTo('wiki', (message, channel, user) => {
  //check not bot
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message
    .text
    .split(' ')
    .slice(1)
    .join(' ');
  //if no args > return nothing

  if (args.length < 1) {
    bot.send(`You need to provide a search query first ${user.name}!`, channel);
    return;
  }
  //typing indicator
  bot.setTypingIndicator(message.channel);

  //search wolfram goes here
}, true);

/**
 * YOUTUBE SEARCH
 */

bot.respondTo('help with youtube video', (message, channel, user) => {
  bot.send(`To use my Youtube search functionality, type \`youtube\` followed by your search query`, channel);
})

bot.respondTo('youtube', (message, channel, user) => {
  //response to youtube
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message
    .text
    .split(' ')
    .slice(1)
    .join(' ');
  //if no args > return nothing

  if (args.length < 1) {
    bot.send('I\'m sorry, but you need to provide a search query!', channel);
    return;
  }
  // set the typing indicator before we start the wikimedia request the typing
  // indicator will be removed once a message is sent
  bot.setTypingIndicator(message.channel);

  getYoutube(args, (err, result, url) => {
    if (err) {
      bot.send(`I\'m sorry, but something went wrong with your query`, channel);
      console.error(err);
      return;
    }

    let resulthere = result.items[0].id.videoId;
    let sendthis = youtubeURL + resulthere;

    bot.send(sendthis, channel);

    // bot.send('I\'m sorry, I couldn\'t find anything on that subject. Try another
    // one!', channel);

  });

}, true);

/**
 * GOOGLE CUSTOM SEARCH
 */

bot.respondTo('help with google search', (message, channel, user) => {
  bot.send(`To use my Google search functionality, type \`google\` followed by your search query`, channel);
})

bot.respondTo('google', (message, channel, user) => {
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message
    .text
    .split(' ')
    .slice(1)
    .join(' ');
  //if no args > return nothing

  if (args.length < 1) {
    bot.send('I\'m sorry, but you need to provide a search query!', channel);
    return;
  }
  // set the typing indicator before we start the wikimedia request the typing
  // indicator will be removed once a message is sent
  bot.setTypingIndicator(message.channel);

  let sendthis = googlesearchURL + args;

  bot.send(sendthis, channel);

  // bot.send('I\'m sorry, I couldn\'t find anything on that subject. Try another
  // one!', channel);

}, true);

/**
 * ADD TODO >
 */
bot.respondTo('store', (message, channel, user) => {
  let args = getArgs(message.text); //get args

  let key = args.shift();
  let value = args.join(' ');

  client.set(key, value, (err) => {
    if (err) {
      bot.send('Oops! I tried to store something but something went wrong.:(', channel);
    } else {
      bot.send(`Okay ${user.name}, I will remember that for you.`, channel);
    }
  });
}, true);

bot.respondTo('retrieve', (message, channel, user) => {
  bot.setTypingIndicator(message.channel);

  let key = getArgs(message.text).shift();

  client.get(key, (err, reply) => {
    if (err) {
      console.log(err);
      bot.send('Oops! I tried to retrieve something but something went wrong :(', channel);
      return;
    }

    bot.send('Here\'s what I remember: ' + reply, channel);
  });
});


/**
 * set note taking function for bot
 */
//take note 
bot.respondTo('take note', (message, channel, user) => {
  let args = getArgs(message.text);

  switch (args[0]) {
    case 'add':
      addNote(user.name, args.slice(1).join(' '), channel);
      break;

   
    case 'delete':
      removeNoteOrNoteList(user.name, args[1], channel);
      break;

    case 'help':
      bot.send('Taking notes with \`take note add [TASK]\`or remove them with \`take note delete [NOTE_NUMBER]\` or \`take note delete all' +'l\`',
      channel);
      break;

    default:
      showNotes(user.name, channel);
      break;
  }
}, true);

//================================================= todo show list todo
function showNotes(name, channel) {
  client.smembers(name, (err, set) => {
    if (err || set.length < 1) {
      bot.send(`You don\'t have any notes listed yet, ${name}!`, channel);
      return;
    }

    bot.send(`${name}'s notes list:`);

    set.forEach((note, index) => {
      bot.send(`${index + 1}. ${note}`, channel);
    });
  });
}

function addNote(name, note, channel) {
  if (note === '') {
    bot.send('Usage: \`take note add [NOTE]\`', channel);
    return;
  }

  client.sadd(name, note);
  bot.send('You added a note!', channel);
  showNotes(name, channel);
}

//remove task in todo list
function removeNoteOrNoteList(name, target, channel) {
  if (typeof target === 'string' && target === 'all') {
    client.del(name);
    bot.send('Note list cleared!', channel);
    return;
  }

  let noteNum = parseInt(target, 10);

  if (Number.isNaN(noteNum)) {
    bot.send('Usage: \`take note delete [NOTE_NUMBER]\` or \`take note delete all\`', channel);
    return;
  }

  // get the set and the exact task
  client.smembers(name, (err, set) => {
    if (err || set.length < 1) {
      bot.send(`You don\'t have any notes to delete, ${name}!`, channel);
      return;
    }

    if (noteNum > set.length || noteNum <= 0) {
      bot.send('Oops, that note doesn\'t exist!', channel);
      return;
    }

    client.srem(name, set[noteNum - 1]);
    bot.send('You deleted a note!', channel);
    showNotes(name, channel);
  });
}
