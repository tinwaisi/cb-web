var config = require('../../config');
var dataMap = config.dataMap;
var gcal = require('google-calendar');
var passport = require('passport');
var CryptoJS = require("crypto-js");
var google = require('googleapis');
var CB_CALENDAR_SUMMARY = 'Crewbrick Projects';
var crm = require("./Crm.js");
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  config.auth.google.id,
  config.auth.google.secret,
  '/auth/google/callback'
);
exports.getUserCalendar = function(req, res){
    console.log(req.session);
    console.log('getUserCalendar');
    console.log(req.session.id);
    console.log(req.user);
    var accessToken = req.session.googleToken;
      console.log("google calendar token", accessToken);
      gcal(accessToken).calendarList.list(function(err, data) {
        if(err){
            return res.json(500,err);
        }
        return res.json(data);
      });
}

exports.getUserEvents = function(req, res){
    console.log(req.session);
    console.log('getUserCalendar');
    console.log(req.session.id);
    console.log(req.user);
    if(req.user && !req.user[dataMap.PERSON_FIELD_MAP.calendarAccessToken]){
        console.log("Account is not connected to Google Calendar");
        res.status(500).json("Account is not connected to Google Calendar");
    }
    var accessToken = req.user?CryptoJS.AES.decrypt(req.user[dataMap.PERSON_FIELD_MAP.calendarAccessToken], config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8):null;
    console.log("google calendar token", accessToken);
    console.log("user get ", accessToken);
    var processData = (data, accessToken)=>{
        for (var i=0; i<data.items.length; i++){
            console.log(data.items[i].id);
            if(data.items[i].primary){
                var id = data.items[i].id;
                var timeZone = data.items[i].timeZone;
                if(!req.user[dataMap.PERSON_FIELD_MAP.calendarId]){
                    console.log(req.user);
                    var person = {id:req.user.id};
                    person[dataMap.PERSON_FIELD_MAP.calendarId] = id;
                    person[dataMap.PERSON_FIELD_MAP.calendarTimeZone] = id;
                    crm.internalUpdatePerson(person).then((res)=>{
                        gcal(accessToken).events.list(data.items[i].id, (err, response)=>{
                            req.session.calendarId = response.calendarId = id;
                            return res.json(response);
                        });
                    });
                } else {
                    gcal(accessToken).events.list(data.items[i].id, (err, response)=>{
                        req.session.calendarId = response.calendarId = id;
                        return res.json(response);
                    });
                }

                break;
            }
        }
    }
    if(accessToken){
        gcal(accessToken).calendarList.list(function(err, data) {
                if(err){
                    console.log('getcalendarEvents', err);
                    if(err){
                        //Refresh token
                        var refreshToken = req.user?CryptoJS.AES.decrypt(req.user[dataMap.PERSON_FIELD_MAP.calendarRefreshToken], config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8):null;
                        console.log('refreshtoken', refreshToken);
                        oauth2Client.setCredentials({
                          access_token: accessToken,
                          refresh_token: refreshToken
                        });
                        console.log(refreshToken);
                        oauth2Client.refreshAccessToken(function(refreshErr, tokens) {

                            console.log('refreshed tokens', refreshErr);
                            console.log('refreshed tokens', tokens);
                            if(tokens.access_token){
                                var person = {id: req.user.id};
                                person[dataMap.PERSON_FIELD_MAP.calendarAccessToken] = CryptoJS.AES.encrypt(tokens.access_token, config.calendarEncryptSecret).toString();
                                crm.internalUpdatePerson(person).then(()=>{
                                    gcal(tokens.accessToken).calendarList.list((retryErr, retryData)=>{
                                        if(err){
                                            console.log("still failed", retryErr);
                                            res.status(500).json(retryErr);
                                        }else{
                                            console.log("success this time", retryData);
                                            processData(retryData, tokens.accessToken);

                                        }
                                    });
                                });

                            }else {
                                reject("Failed to refresh token.")
                            }
                        });
                    }
                }else {
                    processData(data, accessToken);
                }
            });
    } else {
        return res.json(500,"Cannot get calendar events");
    }
}

exports.createCalendarEvent = function(req, res){
    var addToCalendar = (calendarId)=>{
         var event = {};
         gcal(accessToken).events.insert(calendarId, (err, response)=>{
             req.session.calendarId = response.calendarId = id;
             return res.json(response);
         });
    };
    if(req.session.calendarId){

    }
}

exports.createCrewbrickCalendar = function(req, res){
    var accessToken = req.session.googleToken || req.user.googleToken;
    if(accessToken){
        let crewbrickCalendar = {
            id: `Crewbrick-${req.param.id}@group.calendar.google.com`,
            kind: 'calendar#calendarListEntry',
            defaultReminders: [
                {method: "popup", minutes: 30}
            ],
            notificationSettings:{
                notifications: [
                    {type: "eventCreation", method: "email"},
                    {type: "eventChange", method: "email"},
                    {type: "eventCancellation", method: "email"}
                ]
            }
        };
//        TODO: get calendar list first to check if already created
        gcal(accessToken).calendars.insert({summary: "Crewbrick Projects"}, (err, data)=>{
            if(err){
                return res.json(500,err);
            }else {
                req.session.calendarId = data.id;
                return res.json(data);
            }
        });
    }
}

exports.internalCheckFreeBusy = function(encryptedAccessToken, timeMin, timeMax, timeZone, calendarId, refreshToken, personId){
    var accessToken = CryptoJS.AES.decrypt(encryptedAccessToken, config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8);
    var refreshToken = CryptoJS.AES.decrypt(refreshToken, config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8);
    return new Promise(
       (resolve, reject) => {
           if(accessToken){
               console.log("check...", calendarId);
               gcal(accessToken).freebusy.query({timeMin: timeMin, timeMax: timeMax, timeZone: timeZone || 'UTC', items:[{id: calendarId, busy: 'Active'}]}, (err, data)=>{
                   console.log("internalCheckFreeBusy", data, err);
                   if(data){
                        resolve(data);
                   }else {
                        if(err){
                            //Refresh token
                            oauth2Client.setCredentials({
                              access_token: accessToken,
                              refresh_token: refreshToken
                            });
                            console.log(refreshToken);
                            oauth2Client.refreshAccessToken(function(err, tokens) {
                                console.log('refreshed tokens', err);
                                console.log('refreshed tokens', tokens);
                                if(tokens.access_token){
                                    var person = {id: personId};
                                    person[dataMap.PERSON_FIELD_MAP.calendarAccessToken] = CryptoJS.AES.encrypt(tokens.access_token, config.calendarEncryptSecret).toString();
                                    crm.internalUpdatePerson(person);
                                    gcal(tokens.access_token).freebusy.query({timeMin: timeMin, timeMax: timeMax, timeZone: timeZone || 'UTC', items:[{id: calendarId, busy: 'Active'}]}, (err, retryData)=>{
                                       console.log("tried after refreshed token", retryData, err);
                                       if(retryData){
                                           console.log("resolved");
                                            resolve(retryData);
                                       }else {
                                          console.log("rejected");
                                            reject(err);
                                         }
                                    });

                                }else {
                                    reject("Failed to refresh token.")
                                }
                            });
                        }
                        reject(err);
                   }
               });
           }
        }
    );
}

exports.internalMarkToUserCalendar = function(encryptedAccessToken, encryptedRefreshToken, calendarId, start, end, title, description){
    var eventObj = {
        start: { date: start},
        end: {date: end},
        summary: title,
        description: description
    };
    var accessToken = CryptoJS.AES.decrypt(encryptedAccessToken, config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8);
    return new Promise((resolve, reject) => {
         gcal(accessToken).events.insert(calendarId, eventObj, {sendNotifications: true}, (err, insertedEvent)=>{
             if(err){
                 reject(err);
             }else {
                 resolve(insertedEvent);
             }
         });
    });

}