const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


const everydayTasks = [
    '5 min stretches',
    '5 min cleaning',
    'Face exercises',
    'Planche dips',
    'Deep breathing',
    'Brush'
];

// Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     // Authorize a client with credentials, then call the Google Calendar API.
//     // authorize(JSON.parse(content), listEvents);
//     authorize(JSON.parse(content));
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, res) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback, res);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, res);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, res) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client, res);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

// let eventsarray = [];
//
// function listEvents(auth) {
//     calendar.events.list({
//         calendarId: 'primary',
//         timeMin: (new Date()).toISOString(),
//         maxResults: 10,
//         singleEvents: true,
//         orderBy: 'startTime',
//     }, (err, res) => {
//         if (err) return console.log('The API returned an error: ' + err);
//         const events = res.data.items;
//         if (events.length) {
//             console.log('Upcoming 10 events:');
//             events.map((event, i) => {
//                 const start = event.start.dateTime || event.start.date;
//                 console.log(`${start}`);
//                 eventsarray.push(`${start}`);
//             });
//         } else {
//             console.log('No upcoming events found.');
//         }
//     });
// }

function calendarList(auth, res){
    const calendarClient = google.calendar({
       version: 'v3',
       auth
   });
   calendarClient.calendars.get({
       calendarId: 'primary'
   },
   (err, calendarres) => {
       if (err) return console.log('The API returned an error: ' + err);
       const calendars = calendarres.data.items;
       console.log(calendarres);
       res
           .status(200)
           .send(calendars)
           .end();
   });

}




'use strict';

// [START gae_node_request_example]
const express = require('express');

const app = express();

app.get('/', (req, res) => {

    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), calendarList, res);
    });

    // if (oAuth2Client === null || calendarClient === null){
    //     res
    //         .status(200)
    //         .send("Not yet authorized")
    //         .end();
    // }
    // else {
        // calendarClient.calendars.get({
        //     calendarId: 'primary'
        // },
        // (err, calendarres) => {
        //     if (err) return console.log('The API returned an error: ' + err);
        //     const calendars = calendarres.data.items;
        //     res
        //         .status(200)
        //         .send(calendars)
        //         .end();
        // });
    // }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]
