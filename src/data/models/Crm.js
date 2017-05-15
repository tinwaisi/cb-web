var dataMap = require('../../config').dataMap;
var pipedrive = require('./pipedrive');
var googleCalendar = require('./GoogleCalendar');
var pipeClient = pipedrive('505abada69fc2b644fc18f97c7a084635086ef5f');

var sensitiveInfoList = ["password", "salary", "calendarRefreshToken", "calendarAccessToken"];
var personAvailabilityCache = {};
function generateId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function checkAvailability(persons, timeMin, timeMax, timeZone, returnAvailablePersonsOnly){
    console.log('get list... ', persons);
    var promises = [];
    var noCalendarPersons = [],
    cachePersons = [];

    for (var i=0; i<persons.length; i++){
        let person = persons[i];
        var token = person[dataMap.PERSON_FIELD_MAP.calendarAccessToken];
        var calendarId = person[dataMap.PERSON_FIELD_MAP.calendarId];
        if(!personAvailabilityCache[person.id] && token && calendarId){
            console.log('checking... ', persons[i]);
            promises.push(googleCalendar.internalCheckFreeBusy(token, timeMin, timeMax, timeZone, calendarId, person[dataMap.PERSON_FIELD_MAP.calendarRefreshToken], person.id).then((data)=>{
                person = removeSensitiveInfo(person);
                person.availability = data;
                personAvailabilityCache[person.id] = person;
                return person;
            }));
        }else {
            personAvailabilityCache[person.id] ? cachePersons.push(personAvailabilityCache[person.id]) : noCalendarPersons.push(persons[i]);
        }
    }
    return Promise.all(promises).then((persons)=>{
        console.log('promise.all', persons);
        console.log('promise.all', noCalendarPersons);
        console.log('promise.all cachePersons', cachePersons);
        return cachePersons.concat(persons.concat(noCalendarPersons));
    });
}

function removeSensitiveInfo(person){
    if(person){
        for(var i=0, l=sensitiveInfoList.length; i<l; i++){
            delete person[dataMap.PERSON_FIELD_MAP[sensitiveInfoList[i]]];
        }
    }
    return person;
}
exports.getUsers = function(req, res){
    pipeClient.makeRequest('/persons', 'get').then(response => {
        for (var i =0; i<response.data.length; i++){
            delete response.data[i][dataMap.PERSON_FIELD_MAP.password];
        }
        console.log(response);
        return res.send(response.data);

    });
};

exports.getUser = function(req, res){
    console.log("get user sessionid", req.session.id);
    console.log("get user", req.user);
    res.send({user: req.user});
};

exports.getUserDeals = function(req, res){
    console.log("req is", req.session);
    console.log( req.session.id);

//    if(req.params.userId === req.user.id || req.session.userObject.id){
        pipeClient.makeRequest('/persons/'+req.params.userId+'/deals', 'get').then(response => {
            res.send(response.data);
        });
//    }
};
exports.getUserById = function(req, res){
    exports.internalGetUserById(req.params.id).then((response)=>{
        console.log("getUserById:", response);
        res.send(response);
    });
}
exports.internalGetUserById = function(id){
    return pipeClient.makeRequest('/persons/'+id, 'get').then(response => {
        return(response.data);
    });
};

exports.loginUser = function(req, res){
    console.log("login", req.session.id);
    if (req.body.email && req.body.password){
        try{ pipeClient.makeRequest('/persons/find', 'get', null, {term: req.body.email}).then(function(person){
            if(person.data){
                for(var i=0; i<person.data.length; i++){
                    if(person.data[i].email === req.body.email){
                        console.log(person.data[i].email);
                        pipeClient.makeRequest('/persons/'+person.data[i].id, 'get').then(response => {
                            console.log(response.data);
                            if(response.data && response.data[dataMap.PERSON_FIELD_MAP.password] == req.body.password){
                                delete response.data[dataMap.PERSON_FIELD_MAP.password];
                                req.login(response.data, function(error) {
                                    console.log(response.data);
                                    console.log(error);
                                    if (!error) {
                                        req.user = req.session.user = response.data;
                                        req.session.save();
                                        return res.send(response.data);
                                    }
                                });

                            }else {
                                return res.send("Invalid login");
                            }
                            });
                        break;
                    }
                }
            }else {
                return res.send("Invalid login");
            }

        });} catch(e){
            return res.send(e);
        }
    }
};

exports.getDeal = function(req, res){
    pipeClient.makeRequest('/deals/'+req.params.id, 'get').then(response => {
        res.send(response.data);
    });
};

exports.createDeal = function(req, res){
    var form = req.body.form,
        customFields = {};
    form[dataMap.PROJECT_FIELD_MAP.crew] = form[dataMap.PROJECT_FIELD_MAP.crew] || "";
    for (var key in form){
        if(form.hasOwnProperty(key) && dataMap.PROJECT_FIELD_MAP[key]){
            customFields[dataMap.PROJECT_FIELD_MAP[key]] = form[key];
        }
    }
    pipeClient.saveDeal(form.title, null, req.body.userId, null, dataMap.PROJECT_STAGES['Created'], null, customFields).then(response => {
                console.log(response);
                return res.send(response);

            }).catch((e)=>{
                return res.send(e);
            });
};

exports.addParticipantsToDeal = function(req, res){
    var dealId = req.params.id,
        participants = req.body.participants,
        promises = [];

    for (var i=0; i<participants.length; i++){
        promises.push(pipeClient.makeRequest('/deals/'+dealId+'/participants', 'post', {person_id: participants[i]}));
    }

    Promise.all(promises).then((response)=>{
        return res.send(response);

    }).catch((e)=>{
        return res.send(e);
    });
};

exports.updateDeal = function(req, res){
    var dealId = req.params.id,
    deal = req.body.project;

    pipeClient.makeRequest(`/deals/${dealId}`, 'put', deal).then(response => {
        return res.send(response);
    }).catch((e)=>{
        return res.send(e);
    });
};

exports.deleteDeal = function(req, res){
    pipeClient.makeRequest('/deals/'+id, 'delete').then(response => {
        return res.send(response);
    }).catch((e)=>{
        return res.send(e);
    });
}

exports.internalUpdatePerson = function(person){
    return pipeClient.makeRequest(`/persons/${person.id}`, 'put', person);
}

exports.getCandidatesForProject = function(req, res){
    var deal, timeMin, timeMax, promises = [];

    pipeClient.makeRequest('/deals/'+req.params.id, 'get').then(response => {
        deal= response.data;
        console.log('getCandidatesForProject deal = ', deal);
        if(deal){
             timeMin = new Date(deal[dataMap.PROJECT_FIELD_MAP.filmingDates]);
             timeMax = new Date(deal[dataMap.PROJECT_FIELD_MAP.filmingDates]);
             timeMax.setDate(timeMax.getDate() + 1);

             var positions = JSON.parse(deal[dataMap.PROJECT_FIELD_MAP.positionsNeeded]);
             console.log('getCandidatesForProject positions = ', positions);
             console.log('getCandidatesForProject deal.persion_id.value = ', deal.person_id.value);
             positions.items.forEach(position=>{
                 var filterConditions = [{
                            "object": "person",
                            "field_id": dataMap.PERSON_FIELD_ID_MAP.id,
                            "operator": "!=",
                            "value": deal.person_id.value,
                            "extra_value": null
                        },
                        {
                            "object": "person",
                            "field_id": dataMap.PERSON_FIELD_ID_MAP.salary,
                            "operator": "<=",
                            "value": parseInt(position.budget),
                            "extra_value": null
                        },
                        {
                            "object": "person",
                            "field_id": dataMap.PERSON_FIELD_ID_MAP.salary,
                            "operator": ">=",
                            "value": parseInt(position.budget)/2,
                            "extra_value": null
                        },
                        {
                            "object": "person",
                            "field_id": dataMap.PERSON_FIELD_ID_MAP.role,
                            "operator": "LIKE '%$%'",
                            "value": position.position,
                            "extra_value": null
                        }
                    ];
                 var filterId = generateId();
                 var data = {
                       "name": filterId,
                       "conditions": {
                           "glue": "and",
                           "conditions": [
                               {
                                   "glue": "and",
                                   "conditions": filterConditions
                               }
                           ]
                       },
                       "type": "people"
                 };
                 console.log('getCandidatesForProject filter = ', JSON.stringify(data));

                 promises.push(pipeClient.makeRequest('/filters', 'post', data).then(createFilterResponse => {
                      console.log("created filter ", position, createFilterResponse);
                      if(createFilterResponse.data){

                         return getFilteredPersonsAndCheckAvailable(position.position, createFilterResponse.data.id, timeMin, timeMax);
                      }
                 }));
             });

             console.log('getCandidatesForProject promises.length = ', promises.length);
             function getFilteredPersonsAndCheckAvailable(role, filterId, timeMin, timeMax){
                  var personsWithPosition = [];
                  console.log("getFilteredPersonsAndCheckAvailable filterId = ", filterId, timeMin, timeMax);
                  return pipeClient.makeRequest('/persons', 'get', null, {filter_id:filterId}).then(getPersonsResponse => {
                      console.log("getFilteredPersonsAndCheckAvailable getPersonsResponse = ", getPersonsResponse);
                      if(getPersonsResponse.data){
                          console.log("getPersonsResponse", getPersonsResponse.data);
                          for(var i=0, l=getPersonsResponse.data.length; i<l; i++){
                              var person = getPersonsResponse.data[i];
                              console.log("person[dataMap.PERSON_FIELD_MAP.role].indexOf(role)", person[dataMap.PERSON_FIELD_MAP.role]);
                              person[dataMap.PERSON_FIELD_MAP.role] && person[dataMap.PERSON_FIELD_MAP.role].indexOf(role) > -1 ? personsWithPosition.push(person) : null;
                          }
                          console.log("getFilteredPersonsAndCheckAvailable personsWithPosition = ", personsWithPosition);

                          return pipeClient.makeRequest(`/filters/${filterId}`, 'delete', null, {filter_id:filterId}).then(deleteFilterRes => {
                              console.log("deleteFilterRes", deleteFilterRes.data);
                              if(timeMin && timeMax) {
                                    return checkAvailability(personsWithPosition, timeMin, timeMax, 'UTC').then(persons=>{
                                        console.log('done checkAvailability');
                                        return {position: role, candidates: persons};
                                    });
                              }
                          });

                      } else {
                          return {position: role, candidates: []};
                      }
                  });
             }

             Promise.all(promises).then(resultResponse => {
                 console.log('getCandidatesForProject resultResponse = ', resultResponse);
                 res.send(resultResponse);

             });
        }
    });
};

exports.respondToProject = function(req, res){
     if(req.user && req.params.id && req.body.response){
        pipeClient.makeRequest('/deals/'+req.params.id, 'get').then(response => {
            if(response.id){
                var positions = JSON.parse(response[dataMap.PROJECT_FIELD_MAP.positionsNeeded]);
                var isLastResponse = true;
                for (var i=0, l=positions.items.length; i<l; i++){
                    if(positions.items[i].personId === req.user.id){
                        req.body.response==="accepted" ? positions.items[i].personResponse =  "accepted" : null;
                        req.body.response==="declined" ? positions.items[i].personResponse =  "declined" : null;
                    }else {
                        positions.items[i].personResponse === "pending" ? isLastResponse = false : null;
                    }
                }
                var updatedProject = {};
                updatedProject[dataMap.PROJECT_FIELD_MAP.positionsNeeded] = positions;
                !!isLastResponse ? updatedProject.stage_id = dataMap.PROJECT_STAGES.Confirmed : null;
                 pipeClient.makeRequest(`/deals/${dealId}`, 'put', updatedProject).then(updateDealRes => {
                    if(updateDealRes.id){
                        //TODO: mark to user calendar
                        if(req.body.response==="accepted"){

                        }else {
                            res.send(updateDealRes);
                        }
                    }
                }).catch((e)=>{
                    return res.send(e);
                });
            }
        });
     }else {
        res.send(403, "User not logged in")
     }
};
//exports.filterUsers = function(req, res){
//    var filters = req.body.filter;
//    var filterId = generateId();
//    var filterConditions = [];
//    var timeMin = req.body.timeMin;
//    var timeMax = req.body.timeMax;
//    if(filters){
//        for(key in filters){
//            filters.hasOwnProperty(key) ? filterConditions.push({
//                "object": "person",
//                "field_id": key,
//                "operator": filters[key].operator,
//                "value": filters[key].value,
//                "extra_value": null
//            }) : null;
//        }
//        //Filter out the user himself
//        req.user.id ? filterConditions.push({
//            "object": "person",
//            "field_id": "id",
//            "operator": "!=",
//            "value": req.user.id,
//            "extra_value": null
//        }) : null;
//    }
//
//    var data = {
//        "name": filterId,
//        "conditions": {
//            "glue": "and",
//            "conditions": [
//                {
//                    "glue": "and",
//                    "conditions": filterConditions
//                }
//            ]
//        },
//        "type": "persons"
//    };
//
//    function getFilteredPersonsAndCheckAvailable(){
//        pipeClient.makeRequest('/persons', 'get', null, filterConditions.length > 0 ? {filter_id:filterId} : {}).then(getPersonsResponse => {
//            if(getPersonsResponse.data){
//                console.log("getPersonsResponse", getPersonsResponse.data);
//                pipeClient.makeRequest(`/filters/${filterId}`, 'delete', null, {filter_id:filterId}).then(deleteFilterRes => {
//                    console.log("deleteFilterRes", deleteFilterRes.data);
//                });
//                if(timeMin && timeMax) {
//                    checkAvailability(getPersonsResponse.data, timeMin, timeMax, 'UTC').then((persons)=>{
//                        console.log(persons);
//                        res.send(persons);
//                    });
//                }else {
//                    res.send(getPersonsResponse);
//                }
//            }
//        });
//    }
//    //TODO: handle no filter criteria case
//    if(filterConditions.length > 0){
//        pipeClient.makeRequest('/filters', 'post').then(createFilterResponse => {
//            console.log("created filter ", createFilterResponse);
//            if(createFilterResponse.data){
//                getFilteredPersonsAndCheckAvailable();
//            }
//        });
//    }else {
//        getFilteredPersonsAndCheckAvailable();
//    }
//
//}


