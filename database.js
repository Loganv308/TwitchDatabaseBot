import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Database connection module
// Will log errors to the error.log file and the console. 
export class DatabaseUtil{
    constructor(dbName){
        this.dbName = dbName;
        this.db = null;
        // console.log('dbName inside Constructor', dbName)
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const dbPath = path.join(__dirname, 'data', `${dbName}.sqlite`);
        const dataDir = path.dirname(dbPath);
        
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
        // console.log("Database Path in Constructor", dbPath)
        
        this.createDatabase(dbPath);
    };

    createDatabase(dbPath){
        const dbPathString = '' + dbPath;
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPathString, (err) => {
                // console.log('dbPath: ', dbPath);
                // console.log('Database Path String: ', dbPathString);
                // console.log('Database this.db in createDatabase', this.db);
                if (err) {
                    console.error('Error connecting to the database:', err);
                    reject(err);
                } else {
                    this.db.serialize(() => {
                        this.db.run(`CREATE TABLE IF NOT EXISTS ${this.dbName} (
                            FAKE_ID INT,
                            TIMESTAMP TEXT,
                            USER_ACCID TEXT,
                            TWITCH_NAME TEXT,
                            CHAT_MESSAGE TEXT,
                            CHANNEL TEXT
                        )`, (err) => {
                            if (err) {
                                console.error('Error creating table:', err);
                                reject(err);
                            } else {
                                console.log('Table created successfully');
                                resolve();
                            }
                        });
                    });
                }
            });
        });
    }

    insertIntoDatabase(randID, formattedDate, userID, twitchName, chatMessage, named_channel){
        // console.log("this.db inside insertIntoDatabase", this.db)
        this.db.run(`INSERT INTO ${this.dbName} (FAKE_ID, TIMESTAMP, USER_ACCID, TWITCH_NAME, CHAT_MESSAGE, CHANNEL) VALUES(?, ?, ?, ?, ?, ?)`, [randID, formattedDate, userID, twitchName, chatMessage, named_channel], function(err) {
            if (err) {
                console.error("Error initializing database:", err);
                // Handle the error appropriately, such as logging or throwing an exception
            } else {
                // FIX THIS LATER
                
                // console.log("Data inserted successfully into", this.dbName);
            }
        });
    }
    

    closeDatabase(){
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('Closed the database connection.');
                }
            });
        } else {
            console.log('Database connection is not initialized.');
        }}
}