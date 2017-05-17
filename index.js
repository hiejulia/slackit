'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();

const redis = require('redis');
const Bot = require('./Bot');
const Botkit = require('botkit');
const request = require('superagent');
// import the natural library
const natural = require('natural');
// initalize the tokenizer
const tokenizer = new natural.WordTokenizer();
// initialize the stemmer
const stemmer = natural.PorterStemmer;

// attach the stemmer to the prototype of String, enabling
// us to use it as a native String function
stemmer.attach();
//SETUP INFLECTOR
const inflectorNount = new natural.NounInflector();
// console.log(inflector.pluralize('students'));
// console.log(inflector.singularize('student'));

const inflectorCount = natural.CountInflector;
// console.log(inflectorCount.nth(25));
// console.log(inflectorCount.nth(42));
// console.log(inflectorCount.nth(111)); 

const WEBHOOK_URL = 'https://hooks.slack.com/services/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';



//API wiki
const wikiAPI = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="
const wikiURL = 'https://en.wikipedia.org/wiki/';

const youtubesearchAPI = 'http://lamoscar-official.com/you/index.php?key=';

const WeatherAPIKey = '';
const weatherURL = `http://api.openweathermap.org/data/2.5/weather?&units=metric&appid=e215c72486bc176e69502ad13a6b85b2&q=`;


const client = redis.createClient();
/**
 * BOT
 */
const bot = new Bot({
  token: 'xoxb-184548036052-0mRoslDHzAbOSJOKiq8YLm83',
  autoReconnect: true,
  autoMark: true
});

client.on('error', (err) => {
    console.log('Error ' + err);
});

client.on('connect', () => {
  console.log('Connected to Redis!');
});

// Take the message text and return the arguments
function getArgs(msg) {
  return msg.split(' ').slice(1);
}
/**
 * 
 * @param {*} fake weather api call 
 * @param {*} callback 
 */
/**
 * weather json response
 * { 
  coord: { lon: 4.89, lat: 52.37 },
  weather:
   [ { id: 310,
       main: 'Drizzle',
       description: 'light intensity drizzle rain',
       icon: '09n' } ],
  base: 'cmc stations',
  main: { temp: 7, pressure: 1021, humidity: 93, temp_min: 7, temp_max: 7 },
  wind: { speed: 5.1, deg: 340 },
  clouds: { all: 75 },
  dt: 1458500100,
  sys:
   { type: 1,
     id: 5204,
     message: 0.0103,
     country: 'NL',
     sunrise: 1458452421,
     sunset: 1458496543 },
  id: 2759794,
  name: 'Amsterdam',
  cod: 200 
}
 */
function getWeather(location, callback) {
  // make an AJAX GET call to the Open Weather Map API
  request.get(weatherURL + location)
    .end((err, res) => {
      if (err) throw err;
      let data = JSON.parse(res.text);

      if (data.cod === '404') {     
        return callback(new Error('Sorry, I can\'t find that location!')); 
      }

      console.log(data);

      let weather = [];
      data.weather.forEach((feature) => {
        weather.push(feature.description);
      });

      let description = weather.join(' and ');

      callback(data.name, description, data.main.temp);
    });
}


/**
 * WIKI API ADD
 */
function getWikiSummary(term, cb) {
  // replace spaces with unicode
  let parameters = term.replace(/ /g, '%20');
//call superagent
request.get(wikiAPI+parameters)
.end((err, response) =>{
  if(err){
    cb(err);
    return;

  }
let url = wikiURL + parameters;
cb(null, JSON.parse(response.text),url);


});

}

function getYoutubeSummary(term, cb) {
  // replace spaces with unicode
  let parameters = term.replace(/ /g, '%20');
//call superagent
request.get(youtubesearchAPI+parameters)
.end((err, response) =>{
  if(err){
    cb(err);
    return;

  }
// substr(1, 4)
// let url = response.messages[0].text.substr(10,response.messages[0].text.length-1) ;
let url = 'https://www.youtube.com/watch?v=RzhAS_GnJIc';
cb(null, JSON.stringify(response)),url;


});

}



let obj = {
  foo: 'bar',
  baz: {
    foobar: 'bazfoo'
  }
};

function stringifyNestedObjects(obj) {
  for (let k in obj) {
    if (obj[k] instanceof Object) {
      obj[k] = JSON.stringify(obj[k]);  
    }
  }

  return obj;
}

function parseNestedObjects(obj) {
  for (let k in obj) {
    if (typeof obj[k] === 'string' || obj[k] instanceof String) {
      try {
        obj[k] = JSON.parse(obj[k]);
      } catch(e) {
        // string wasn't a stringified object, so fail silently
      }      
    }
  }

  return obj;
}

// set hash
client.hmset('obj', stringifyNestedObjects(obj));

// retrieve hash
client.hgetall('obj', (err, object) => {
  console.log(parseNestedObjects(object));
});

client.del('heroes');

// set list
client.rpush('heroes', ['batman', 'superman', 'spider-man']);

// retrieve list
client.lrange('heroes', 0, -1, (err, list) => {
  console.log(list);
});

// store set
client.sadd('fruits', ['apples', 'bananas', 'oranges']);
client.sadd('fruits', 'bananas');

// retrieve set
client.smembers('fruits', (err, set) => {
  console.log(set);
});

// store sorted set
client.zadd('scores', [3, 'paul', 2, 'caitlin', 1, 'alex']);

client.zrange('scores', 0, -1, (err, set) => {
  console.log(set);
});

client.zrevrange('scores', 0, -1, 'withscores', (err, set) => {
  console.log(set);

  let arr = [];
  for (let i = 0; i < set.length; i++) {
    arr.push([set[i], set[i + 1]]);
    i++;
  }
  console.log(arr);
})
//HELLO
// bot.respondTo(/(hello|hi) (bot|assistantbot)/g.test(msg),(message,channel,user) => {
//   bot.send(`Hello ${user.name}`,channel)
// })

bot.respondTo('hello bot',(message,channel, user) => {
  bot.send(`Hello ${user.name}`,channel);


})
/**
 * TOKENIZE
 */
// // respond to any message that comes through
// bot.respondTo('', (message, channel, user) => {

//   let tokenizedMessage = tokenizer.tokenize(message.text);

//   bot.send(`Tokenized message: ${JSON.stringify(tokenizedMessage)}`, channel);
// });
/**
 * STEM
 */
// respond to any message that comes through
// bot.respondTo('', (message, channel, user) => {
//   let stemmedMessage = stemmer.stem(message.text);
  
//   bot.send(`Stemmed message: ${JSON.stringify(stemmedMessage)}`, channel);
// //   let distance = natural.LevenshteinDistance('weather', 'heater');

// // console.log('Distance:', distance); // distance of 10
// // let distance2 = natural.LevenshteinDistance('weather', 'weather');

// // console.log('Distance2:', distance2); // distance of 0
// });
/**
 * STRING DISTANCE TEST 
 */
bot.respondTo('', (message, channel, user) => {
  // grab the command from the message's text
  let command = message.text.split(' ')[0];

  let distance = natural.LevenshteinDistance('weather', command);

  // our typo tolerance, a higher number means a larger 
  // string distance
  let tolerance = 2;

  // if the distance between the given command and 'weather' is
  // only 2 string distance, then that's considered close enough
  if (distance <= tolerance) {
    bot.send(`Looks like you were trying to get the weather, ${user.name}!`, channel);
  }}, true);

/**
 * inflectorCount
 */
bot.respondTo('what day is it', (message, channel) => {
  let date = new Date();

  // use the ECMAScript Internationalization API to convert 
  // month numbers into names
  let locale = 'en-us';
  let month = date.toLocaleString(locale, { month: 'long' });
  bot.send(`It is the ${inflectorCount.nth(date.getDate())} of ${month}.`, channel);
}, true);

bot.respondTo('weather', (message, channel, user) => {
  let args = getArgs(message.text);

  let city = args.join(' ');

  getWeather(city, (error, fullName, description, temperature) => {
    if (error) {
      bot.send(error.message, channel);
      return;
    }

    bot.send(`The weather for ${fullName} is ${description} with a temperature of ${Math.round(temperature)} celsius.`, channel);
  });
}, true);


bot.respondTo('hey bot',(message,channel, user) => {
  bot.send(`Yes ${user.name}, what's up?`,channel)
})

bot.respondTo('github',(message,channel, user) => {
  request
  .post(WEBHOOK_URL)
  .send({
    username: "Incoming bot",
    channel: "#general",
    icon_emoji: ":+1:",
    text: 'Hello! Here is a fun link: <http://www.github.com|Github is great!>'
  })
  .end((err, res) => {
    console.log(res);
  });
})

//say thanks
bot.respondTo('thanks',(message,channel, user) => {
  bot.send(`You are welcome ${user.name} :)`,channel)
})

//uptime
bot.respondTo('uptime',(message, channel,user) => {
  let uptime = process.uptime();

      // get the uptime in hours, minutes and seconds
      let minutes = parseInt(uptime / 60, 10),
          hours = parseInt(minutes / 60, 10),
          seconds = parseInt(uptime - (minutes * 60) - ((hours * 60) * 60), 10);

      bot.send(`I have been running for: ${hours} hours, ${minutes} minutes and ${seconds} seconds.`, channel);
})

/**
 * WIKI API 
 * 
 */
bot.respondTo('help with wiki',(message, channel, user) => {
  bot.send(`To use my Wikipedia functionality, type \`wiki\` followed by your search query`, channel);
})

bot.respondTo('wiki',(message,channel, user) => {
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message.text.split(' ').slice(1).join(' ');
  //if no args > return nothing
  
  if (args.length < 1) {
    bot.send('I\'m sorry, but you need to provide a search query!', channel);
    return;
  }
  // set the typing indicator before we start the wikimedia request
  // the typing indicator will be removed once a message is sent
  bot.setTypingIndicator(message.channel);

  getWikiSummary(args, (err, result, url) => {
    if (err) {
      bot.send(`I\'m sorry, but something went wrong with your query`, channel);
      console.error(err);
      return;
    }

    let pageID = Object.keys(result.query.pages)[0];

    // -1 indicates that the article doesn't exist
    if (parseInt(pageID, 10) === -1) {
      bot.send('That page does not exist yet, perhaps you\'d like to create it:', channel);
      bot.send(url, channel);
      return;
    }

    let page = result.query.pages[pageID];
    let summary = page.extract;

    if (/may refer to/i.test(summary)) {
      bot.send('Your search query may refer to multiple things, please be more specific or visit:', channel);
      bot.send(url, channel);
      return;
    }

    if (summary !== '') {
      bot.send(url, channel);

      let paragraphs = summary.split('\n');

      paragraphs.forEach((paragraph) => {
        if (paragraph !== '') {
          bot.send(`> ${paragraph}`, channel);
        }
      });
    } else {
      bot.send('I\'m sorry, I couldn\'t find anything on that subject. Try another one!', channel);
    }
  });
}, true);



/**
 * YOUTUBE SEARCH
 */

bot.respondTo('help with youtube video',(message, channel, user) => {
  bot.send(`To use my Youtube search functionality, type \`youtube\` followed by your search query`, channel);
})

bot.respondTo('youtube',(message,channel, user) => {
  if (user && user.is_bot) {
    return;
  }
  //grab search term param, > remove wiki in the beginning
  let args = message.text.split(' ').slice(1).join(' ');
  //if no args > return nothing
  
  if (args.length < 1) {
    bot.send('I\'m sorry, but you need to provide a search query!', channel);
    return;
  }
  // set the typing indicator before we start the wikimedia request
  // the typing indicator will be removed once a message is sent
  bot.setTypingIndicator(message.channel);
setTimeout(() => {
   getYoutubeSummary(args, (err, result, url) => {
    if (err) {
      bot.send(`I\'m sorry, but something went wrong with your query`, channel);
      console.error(err);
      return;
    } else {
let url1 = 'https://www.youtube.com/watch?v=RzhAS_GnJIc';
      bot.send(url1, channel);


    }

      //bot.send('I\'m sorry, I couldn\'t find anything on that subject. Try another one!', channel);
    
  });
  }, 1000);
  


}, true);





bot.respondTo('store', (message, channel, user) => {
  let args = getArgs(message.text);

  let key = args.shift();
  let value = args.join(' ');

  client.set(key, value, (err) => {
    if (err) {
      bot.send('Oops! I tried to store something but something went wrong :(', channel);
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

bot.respondTo('roll', (message, channel, user) => {
  // get the members of the channel
  const members = bot.getMembersByChannel(channel);

  // make sure there actually members to interact with. If there
  // aren’t then it usually means that the command was given in a  
  // direct message
  if (!members) {
    bot.send('You have to challenge someone in a channel, not a direct message!', channel);
    return;
  }

  // get the arguments from the message body
  let args = getArgs(message.text);

  // if args is empty, return with a warning
  if (args.length < 1) {
    bot.send('You have to provide the name of the person you wish to challenge!', channel);
    return;
  }

  // the user shouldn't challenge themselves
  if (args.indexOf(user.name) > -1) {
    bot.send(`Challenging yourself is probably not the best use of your or my time, ${user.name}`, channel);
    return;
  }

  // does the opponent exist in this channel?
  if (members.indexOf(args[0]) < 0) {
    bot.send(`Sorry ${user.name}, but I either can't find ${args[0]} in this channel, or they are a bot!`, channel);
    return;
  }

  // Roll two random numbers between 0 and 100
  let firstRoll = Math.round(Math.random() * 100);
  let secondRoll = Math.round(Math.random() * 100);

  let challenger = user.name;
  let opponent = args[0];

  // reroll in the unlikely event that it's a tie
  while (firstRoll === secondRoll) {
    secondRoll = Math.round(Math.random() * 100);
  }

  let winner = firstRoll > secondRoll ? challenger : opponent;

  client.zincrby('rollscores', 1, winner);

  // Using new line characters (\n) to format our response
  bot.send(
    `${challenger} fancies their changes against ${opponent}!\n
${challenger} rolls: ${firstRoll}\n
${opponent} rolls: ${secondRoll}\n\n
*${winner} is the winner!*`
  , channel);

}, true);

bot.respondTo('scoreboard', (message, channel, user) => {
  let args = getArgs(message.text);

  if (args[0] === 'wipe') {
    client.del('rollscores');
    bot.send('The scoreboard has been wiped!', channel);
    return;
  }

  client.zrevrange('rollscores', 0, -1, 'withscores', (err, set) => {
    if (err) {
      bot.send('Oops, something went wrong! Please try again later', channel);
      return;
    }

    if (set.length < 1) {
      bot.send('No scores yet! Challenge each other with the \`roll\` command!', channel);
      return;
    }

    let scores = [];

    // format the set into something a bit easier to use
    for (let i = 0; i < set.length; i++) {
      scores.push([set[i], set[i + 1]]);
      i++;
    }

    bot.send('The current scoreboard is:', channel);
    scores.forEach((score, index) => {
      bot.send(`${index + 1}. ${score[0]} with ${score[1]} points.`, channel);
    });
  });
}, true);

bot.respondTo('todo', (message, channel, user) => {
  let args = getArgs(message.text);

  switch(args[0]) {
    case 'add':
      addTask(user.name, args.slice(1).join(' '), channel);
      break;

    case 'complete':
      completeTask(user.name, parseInt(args[1], 10), channel);
      break;

    case 'delete':
      removeTaskOrTodoList(user.name, args[1], channel);
      break;

    case 'help':
      bot.send('Create tasks with \`todo add [TASK]\`, complete them with \`todo complete [TASK_NUMBER]\` and remove them with \`todo delete [TASK_NUMBER]\` or \`todo delete all\`', channel);
      break;

    default:
      showTodos(user.name, channel);
      break;
  }
}, true);




//================================================= todo 

function showTodos(name, channel) {
  client.smembers(name, (err, set) => {
    if (err || set.length < 1) {
      bot.send(`You don\'t have any tasks listed yet, ${name}!`, channel);
      return;
    }

    bot.send(`${name}'s to-do list:`);

    set.forEach((task, index) => {
      bot.send(`${index + 1}. ${task}`, channel);
    });
  });
}

function addTask(name, task, channel) {
  if (task === '') {
    bot.send('Usage: \`todo add [TASK]\`', channel);
    return;
  }

  client.sadd(name, task);
  bot.send('You added a task!', channel);
  showTodos(name, channel);
}

function completeTask(name, taskNum, channel) {
  if (Number.isNaN(taskNum)) {
    bot.send('Usage: \`todo complete [TASK_NUMBER]\`', channel);
    return;
  }

  client.smembers(name, (err, set) => {
    if (err || set.length < 1) {
      bot.send(`You don\'t have any tasks listed yet, ${user.name}!`, channel);
      return;
    }

    // make sure no task numbers that are out of bounds are given
    if (taskNum > set.length || taskNum <= 0) {
      bot.send('Oops, that task doesn\'t exist!', channel);
      return;
    }

    let task = set[taskNum - 1];

    if (/~/i.test(task)) {
      bot.send('That task has already been completed!', channel);
      return;
    }

    // remove the task from the set
    client.srem(name, task);

    // re-add the task, but with a strikethrough effect
    client.sadd(name, `~${task}~`);

    bot.send('You completed a task!', channel);
    showTodos(name, channel);
  });
}

function removeTaskOrTodoList(name, target, channel) {
  if (typeof target === 'string' && target === 'all') {
    client.del(name);
    bot.send('To-do list cleared!', channel);
    return;
  }

  let taskNum = parseInt(target, 10);

  if (Number.isNaN(taskNum)) {
    bot.send('Usage: \`todo delete [TASK_NUMBER]\` or \`todo delete all\`', channel);
    return;
  }

  // get the set and the exact task
  client.smembers(name, (err, set) => {
    if (err || set.length < 1) {
      bot.send(`You don\'t have any tasks to delete, ${name}!`, channel);
      return;
    }

    if (taskNum > set.length || taskNum <= 0) {
      bot.send('Oops, that task doesn\'t exist!', channel);
      return;
    }

    client.srem(name, set[taskNum - 1]);
    bot.send('You deleted a task!', channel);
    showTodos(name, channel);
  });  
}



//display data more naturally





// // start server
// app.listen(port, function (req, res) {
//     console.info(`Started Express server on port ${port}`)
// });


// beginning > true