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
            return res.send(500,err);
        }
        return res.send(data);
      });
}

exports.getUserEvents = function(req, res){
    console.log(req.session);
    console.log('getUserCalendar');
    console.log(req.session.id);
    console.log(req.user);
    var accessToken = req.session.googleToken || (req.user?CryptoJS.AES.decrypt(req.user[dataMap.PERSON_FIELD_MAP.calendarAccessToken], config.calendarEncryptSecret).toString(CryptoJS.enc.Utf8):null);
    console.log("google calendar token", accessToken);
    console.log("user get ", accessToken);
    if(accessToken){
        gcal(accessToken).calendarList.list(function(err, data) {
                if(err){
                    console.log('getcalendarEvents', err);
                    return res.send(500,err);
                }else {
                    for (var i=0; i<data.items.length; i++){
                        console.log(data.items[i].id);
                        if(data.items[i].primary){
                            var id = data.items[i].id;
                            if(!req.user[dataMap.PERSON_FIELD_MAP.calendarId]){
                                console.log(req.user);
                                var person = {id:req.user.id};
                                person[dataMap.PERSON_FIELD_MAP.calendarId] = id;
                                crm.internalUpdatePerson(person).then((res)=>{
                                    gcal(accessToken).events.list(data.items[i].id, (err, response)=>{
                                        req.session.calendarId = response.calendarId = id;
                                        return res.send(response);
                                    });
                                });
                            } else {
                                gcal(accessToken).events.list(data.items[i].id, (err, response)=>{
                                    req.session.calendarId = response.calendarId = id;
                                    return res.send(response);
                                });
                            }

                            break;
                        }
                    }
                }
            });
    } else {
        return res.send(500,"Cannot get calendar events");
    }
}

exports.createCalendarEvent = function(req, res){
    var addToCalendar = (calendarId)=>{
         var event = {};
         gcal(accessToken).events.insert(calendarId, (err, response)=>{
             req.session.calendarId = response.calendarId = id;
             return res.send(response);
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
                return res.send(500,err);
            }else {
                req.session.calendarId = data.id;
                return res.send(data);
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