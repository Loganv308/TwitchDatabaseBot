const tmi = require('tmi.js');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('TwitchBotDatabase.sqlite');

const client = new tmi.Client(
    {
  connection: 
  {
    secure: true,
    reconnect: true
  },
  channels: [ 'schlatt' ]
});

client.connect();

const winston = require('winston');

const wbs = require('winston-better-sqlite3');
const { transports } = require('./logger');

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

function errorMessage(err)
{
  if (err) 
  {
    return console.log(err.message);
  }
};

client.on('message', (channel, tags, message, self) => 
{
  chatMessage = message;
  var d = new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
  console.log(`(${tags['user-id']}) ${tags['display-name']}: ${chatMessage}`);
  userID = tags['user-id'];
  twitchName = tags['display-name'];
  id = tags['color'];

  randID = Math.floor(Math.random() * 10000000)
 
  db.run(`INSERT INTO TwitchChatDatabase(FAKE_ID, ACC_ID, TIMESTAMP, USER_ACCID, TWITCH_NAME, CHAT_MESSAGE) VALUES(?, ?, ?, ?, ?, ?)`, [randID, userID, d, userID, twitchName, chatMessage], errorMessage); 
}); 

// "INSERT INTO TwitchChatDatabase(USER_ID) VALUES(?)", [`(${tags['USER_ID']}`],
// INSERT INTO TwitchChatDatabase(TWITCH_NAME) VALUES(?)", [`(${tags['TWITCH_NAME']})`],
// ['C'], function(err) { if (err) { return console.log(err.message); } 

