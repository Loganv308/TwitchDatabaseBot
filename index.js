import { Client } from 'tmi.js'; // This line is importing the tmi module. Short for "Twitch Messaging interface"
import { createLogger, format as _format, transports as _transports } from 'winston'; // Winston module (Logger)
import { stat } from 'fs'; // File system module
import axios from 'axios'; // Axios module (HTTP requests)
import increment from "./counter.js"; // Counter module

// This lines is required for the script. It is used to load the .env file.
import dotenv from 'dotenv'
dotenv.config()

import { DatabaseUtil } from './database.js'; // Database module

const db = new DatabaseUtil("ChatDatabase"); // Database connection
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// This is the redirect URI. It is used to specify where the user will be redirected after the OAuth flow.
const redirectUri = 'http://localhost/8080';

// This is the scope of the bot. It is used to specify what the bot can do.
const scope = 'channel:read:subscriptions';

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
          'Client-ID': process.env.CLIENT_ID,
      },
      params: {
          first: 10
      }
  })
  .then(response => {
    try{
      for(let x in response.data.data[0].user_name){
        const viewerCount = response.data.data[x].viewer_count;
        const userName = response.data.data[x].user_name;
        console.log("Top channel #:", increment(), userName, "with", viewerCount, "viewers" );
      }
    }
    catch(err)
    {
      console.log(err);
    }
    
      
      return response.data.data;
  })
  .catch(error => { console.log(error); });
}

// The line below is the logger creation
// Syntax: 
//    logger.error('Test Error')
//    logger.warn('Test warning')
const logger = createLogger({
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
  format: _format.json(),
  transports: 
  [
    new _transports.Console(),
    new _transports.File({ filename: 'logs/activity/error.log', level:'error', colorize: true}),
    new _transports.File({ filename: 'logs/activity/activity.log', level:'info', colorize: true}),
    new _transports.File({ filename: 'logs/activity/warn.log', level:'warn', colorize: true}),
    new _transports.File({ filename: 'logs/activity/debug.log', level:'debug', colorize: true})
  ]
});


// Client connecting to Twitch. You can specify the channel or channels you want to connect to in the code below. 
const client = new Client(
    {
  connection: 
  {
    secure: true,
    reconnect: true
  },
  channels: [ 
    // 'hasanabi'
    // 'moistcr1tikal'
    'paymoneywubby',
    'moonmoon',
    // 'adinross',
    // 'mizkif',
    'xqc'
    // 'summit1g',
    // 'lirik',
    // 'shroud',
    // 'pokimane',
    // 'sodapoppin'
    // 'schlatt'
   ]
});

// Connects the client
const connectToTwitch = () => {
  client.connect();
  console.log("Connected to Twitch");
}

const processFile = () => { // This function is used to check the size of the database file. If it gets too big, it will exit the program.
  stat("TwitchBotDatabase.sqlite", (err, stats) => {
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

setInterval(processFile, 10000);
// Everytime there is a message in the twitch chat, the following lines will trigger. 
// This is mostly just writing stuff to the database and formatting information correctly.
client.on('message', (channel, tags, message) => 
{
  const chatMessage = message.replace(/'/g, "''");
  const formattedDate = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
  const userID = tags['user-id']; // ID of the user, used for the database.
  const twitchName = tags['display-name']; // Name of the user, used for the database.
  const subscriber = tags['subscriber']; // ID of the user, used for the database.
  let randID = Math.floor(Math.random() * 10_000_000_000); // Random ID for the database.

  const named_channel = channel.replace('#', '').toUpperCase(); // Name of the channel, without the #.

  db.insertIntoDatabase(randID, formattedDate, userID, twitchName, chatMessage, named_channel);

  if (subscriber == '1') {
    console.log(`(${increment()})(${named_channel})(${tags['user-id']})(SUB) ${tags['display-name']}: ${chatMessage}`); // If the user is a subscriber, it will log that to the database.
  } else {
    console.log(`(${increment()})(${named_channel})(${tags['user-id']}) ${tags['display-name']}: ${chatMessage}`); // If the user is not a subscriber, it will log that to the database.
  }

   
});

getTopChannels()
connectToTwitch();
processFile();