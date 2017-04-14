var pipeClient = require('node-pipedrive')('505abada69fc2b644fc18f97c7a084635086ef5f');

var PERSON_FIELD_MAP = {
                'password': '891999ff541ecc95b51e25f8ed230df11b816a4f',
                'role': '7f2ecafe427ee60cf8c550969dbe494caf92684f',
                'salary': 'bfef00b1dbc3f7a4a6067545a603d1b56a8300a1'
            },
  PROJECT_FIELD_MAP= {
      'crew': '092f8b6b0e6e9d50af512bb0dae8d6bf50c1c345',
      'filmingDates': 'e8a75e8a7e81852ca94abda7f9c9e898997aca52',
      'finalDeadline': '7b785e4d0aa1e93951065c8ceb784d827da3b532',
      'projectName': 'da0e73bb413d2bf582c0e6d758dd787889ba9b97',
      'transferFileMethod': 'b0956fa669b346a6d9247760c713f34398016026',
      'description': '35490f0388fdb40ae694bcae99377afd74554dd5',
      'positionsNeeded': '525a68964cd0e0f66493819c9cb7003204e4f047'
  }
exports.getUsers = function(req, res){
    pipeClient.makeRequest('/persons', 'get').then(response => {
        for (var i =0; i<response.data.length; i++){
            delete response.data[i][PERSON_FIELD_MAP.password];
        }
        console.log(response);
        return res.send(response.data);

    });
}

exports.loginUser = function(req, res){
    if (req.body.email && req.body.password){
        try{pipeClient.makeRequest('/persons/find', 'get', null, {term: req.body.email}).then(function(person){
            console.log(person.data);
            if(person.data){
                for(var i=0; i<person.data.length; i++){
                    if(person.data[i].email === req.body.email){
                        pipeClient.makeRequest('/persons/'+person.data[i].id, 'get').then(response => {
                            if(response.data && response.data[PERSON_FIELD_MAP.password] == req.body.password){
                                delete response.data[PERSON_FIELD_MAP.password];
                                return res.send(response.data);
                            }else {
                                res.send("Invalid login");
                            }
                            });
                        break;
                    }
                }
            }else {
                res.send("Invalid login");
            }

        });} catch(e){
            res.send(e);
        }
    }

}