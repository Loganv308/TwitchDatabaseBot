var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TwitchBotDatabase.sqlite');
const logger = require('./logger').verbose();
const port = 3000;
const host = "localhost";
const express = require('express')
const router = express()
const mainPage = require('./main.html')

router.get('/', function (req, res) 
{   
    res.send()
    
    logger.info("Successfully pushed Data to user");

    module.exports = router;
    
});
router.get('/main', function (req, res) 
{   
    app.get("/main", mainPage);

    module.exports = router;
});

let db3 = new sqlite3.Database('TwitchBotDatabase.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
    console.error(err.message);
    } // Else
    console.log('Connected to the TwitchBotDatabase database.');
    logger.info("Connected to the TwitchBotDatabase database.");
    });

router.get('/',(req,res) => 
{
logger.info("Server Sent a Successful Load");
}) 

// Capture 500 errors
router.use((err,req,res,next) => {
res.status(500).send('Could not perform the calculation!');
logger.error(`${err.status || 500} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
})

// Capture 404 erors
router.use((req,res,next) => {
    res.status(404).send("PAGE NOT FOUND");
    logger.error(`400 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
})
// Run the server
router.listen(port, () => {
    console.log("Server started...");
    logger.info(`Server started and running on http://${host}:${port}`)
})

// The below code will need to be edited to fit the TwitchChatDatabase table properly.

// db.serialize(() => {
//     db.each(`SELECT PlaylistId as id,
//                     Name as name
//             FROM playlists`, (err, row) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log(row.id + "\t" + row.name);
//     });
// });



  