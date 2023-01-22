const tmi = require('tmi.js'); // This line is importing the tmi module. Short for "Twitch Messaging interface"
const sqlite3 = require('sqlite3').verbose(); // Sqlite3 connection (Database for those who don't know...)
const winston = require('winston'); // Winston module (Logger)
const db2 = "TwitchBotDatabase.sqlite"; // DB file specification
const fs = require('fs'); // File system module
const axios = require('axios'); // Axios module (HTTP requests)
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const clientId = '';
const clientSecret = '';
const redirectUri = 'http://localhost';
const scope = 'channel:read:subscriptions';

const counter = createCounter();

async function getOAuthToken() {
    const response = await axios({
      method: 'post',
      url: 'https://id.twitch.tv/oauth2/token',
      data: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&redirect_uri=${redirectUri}&scope=${scope}`,
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
  });
  console.log("Auth Token:", response.data.access_token);
  return response.data.access_token;
}

async function getTopChannels() {
  const token = await getOAuthToken();
  
  return axios.get('https://api.twitch.tv/helix/streams', {
      method: 'get',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Client-ID': 'q8zrgvu9zd1um07dguictvr6r1r0dh',
      },
      params: {
          first: 10
      }
  })
  .then(response => {
      const viewerCount = response.data.data['0'].viewer_count;
      const userName = response.data.data['0'].user_name;
      console.log("Top channel:", userName, "with", viewerCount, "viewers" );
      
      return response.data.data;

  })
  .catch(error => { console.log(error); });
}

// Custom function for logging
function errorMessage(err)
{
  if (err) 
  {
    return console.log(err.message);
    
  }
};

// The line below is the logger creation
// Syntax: 
//    logger.error('Test Error')
//    logger.warn('Test warning')
const logger = winston.createLogger({
  levels: 
  {
      'error': 0,
      'warn': 1,
      'info': 2,
      'debug': 3, 
  },
  color:
  {
      'error': 'red',
      'warn': 'yellow',
      'info': 'green',
      'debug': 'blue',
  },
  format: winston.format.json(),
  transports: 
  [
    new winston.transports.Console(),  
    new winston.transports.File({ filename: 'logs/error.log', level:'error', colorize: true}),
    new winston.transports.File({ filename: 'logs/activity/activity.log', level:'info', colorize: true}),
    new winston.transports.File({ filename: 'logs/activity/warn.log', level:'warn', colorize: true}),
    new winston.transports.File({ filename: 'logs/activity/debug.log', level:'debug', colorize: true})
  ]
});

// Database connection module
// Will log errors to the error.log file and the console. 
let db = new sqlite3.Database(db2, sqlite3.OPEN_READWRITE, (err) => 
{
    console.log('Connected to the TwitchBotDatabase.');
});

// Client connecting to Twitch. You can specify the channel or channels you want to connect to in the code below. 
const client = new tmi.Client(
    {
  connection: 
  {
    secure: true,
    reconnect: true
  },
  channels: [ 
    // 'hasanabi'
    'moistcr1tikal'
    // 'paymoneywubby',
    // 'adinross',
    // 'mizkif',
    // 'xqc'
    // 'summit1g',
    // 'lirik',
    // 'shroud',
    // 'pokimane',
    // 'sodapoppin'
   ]
});

// Connects the client
const connectToTwitch = () => {
  client.connect();
  console.log("Connected to Twitch");
}

const processFile = () => { // This function is used to check the size of the database file. If it gets too big, it will exit the program.
  fs.stat("TwitchBotDatabase.sqlite", (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (stats.size > 100000000) { // 100MB
      console.error("File is too big, exiting");
      clearInterval(intervalId);
      process.exit();
    }

  });
}

function createCounter() {
  let count = 0;
  return function incrementCount() {
    count++;
    return count;
  };
}
setInterval(processFile, 10000);

// Everytime there is a message in the twitch chat, the following lines will trigger. 
// This is mostly just writing stuff to the database and formatting information correctly.
client.on('message', (channel, tags, message, self) => 
{
  chatMessage= message = message.replace(/'/g, "''");
  
  d = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
  
  userID = tags['user-id']; // ID of the user, used for the database.
  
  twitchName = tags['display-name']; // Name of the user, used for the database.
  
  subscriber = tags['subscriber']; // ID of the user, used for the database.
  
  randID = Math.floor(Math.random() * 10_000_000_000); // Random ID for the database.

  named_channel = channel.replace('#', '').toUpperCase(); // Name of the channel, without the #.

  if (tags['subscriber'] == '1') {
    console.log(`(${counter()})(${named_channel})(${tags['user-id']})(SUB) ${tags['display-name']}: ${chatMessage}`); // If the user is a subscriber, it will log that to the database.
    
  }
  else {
    console.log(`(${counter()})(${named_channel})(${tags['user-id']}) ${tags['display-name']}: ${chatMessage}`); // If the user is not a subscriber, it will log that to the database.
    
  }

  db.run(`INSERT INTO TwitchChatDatabase(FAKE_ID, TIMESTAMP, USER_ACCID, TWITCH_NAME, CHAT_MESSAGE, CHANNEL) VALUES(?, ?, ?, ?, ?, ?)`, [randID, d, userID, twitchName, chatMessage, named_channel], errorMessage); 
});

getTopChannels()
connectToTwitch();
processFile();


