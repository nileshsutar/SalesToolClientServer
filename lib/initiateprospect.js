// imports packages
var datetimehelpers = require('../helpers/datetime');
var ruleengine = require("../config/ruleengine");

var https = require("http");
var Q = require("q");

getProspectPromiseWithQ = function(email){
    var deffered = Q.defer();
    var options = {        
        hostname: "172.25.24.26",        
        port: "8080",        
        path: "/JerseyDemo/rest/jsonServices/salestool",
        method: 'POST',
        headers:{
            "Content-Type":"application/json",
        }
    };

    data = JSON.stringify({"data": email.text})    
    try{
       var httpsReq = https.request(options, function(res){
            try{
                res.setEncoding('utf8');                
                res.on('data', function (chunk) {
                    var jsonObject = JSON.parse(chunk);                    
                    deffered.resolve(jsonObject);
                });
            }catch(exception){
                console.log("Exception in internal call", exception);
                deffered.reject(exception);
            }
        });
        httpsReq.on("error", function(e){
           //console.log("Error with request:"+e.message);
           deffered.reject(e);
        });
        httpsReq.write(data);
        httpsReq.end();        
    }catch(ex) {
        console.log('Exceptoion occorued - ', ex);
        deffered.reject(ex);
    }
    return deffered.promise;
};

var getProspectNameWithQ = function(mail){
    var deffered = Q.defer();
    getProspectPromiseWithQ(mail)
        .then(function(res){
            console.log("deffered resolve response======>", res);
            orgnizations = res.ORGANIZATION;
            prospectName = orgnizations[0];
            console.log("orgnization="+orgnizations[0]);           
            deffered.resolve(prospectName);
        }, function(error){            
            //console.log("Error deffered reject==", error);
            deffered.reject(error);
        })
        .catch(function(error){
            //console.log("Error in deffered reject========>", error);
            deffered.reject(error);
        });
        
        return deffered.promise;
};

var getNewProspectDetails = function(email){
    var prospect = {};
    prospect._id = datetimehelpers.getUniqueTime();    
    var prospectName;
    var deffered = Q.defer();  
    getProspectNameWithQ(email)
        .then(function(prospectName){
            console.log("prospectName====>", prospectName);
            prospect.name = prospectName;
            prospect.subject = email.subject;

            var from = email.from;
            var cc = '';
            if (typeof email.cc == "String"){
                    cc = email.cc;
            }
            prospect.from = from[0].address;
            prospect.from_name = from[0].name;
            prospect.send_date = email.date.toLocaleString();
            prospect.cc = cc;
            prospect.message = email.text;
            prospect.contents = email.text;
            prospect.stage = 0;
            prospect.state = "Initiation";
            prospect.state_id = 1;
            deffered.resolve(prospect);
        }, function(err){
            //console.log("Error in get New Prospect Details====", err);
            deffered.reject(err);
        });
        return deffered.promise;
}

var createCycleWithQ = function(req, res){
    var newProspect = req.body;
    var newCycle = newProspect.cycle_id;
    
    newCycle.cycle_no = 1;
    newCycle.status = "In progress";
    newCycle.prospect_id = newProspect._id;
    newCycle.prospect = newProspect.name;
    newCycle.current_state = newProspect.state_id;
    var d = new Date();
    newCycle.start_date = d.toDateString();
    
    var cycles = require('../controllers/cycles.controller');
    var response = {
        send: function(cycle) {
            //console.log('cycle from response=========>', cycle);
        },
        status: function(statusCode){
            if (statusCode != 400)
                console.log("cycle created successfully");
        }
    };
    
    var prospectCycle = {};
    prospectCycle.body = newCycle;
    cycleDeffered = Q.defer();
    //console.log("before calling create cycle"); 
    cycles.create(prospectCycle, response)
        .then(function(res){
            console.log("response after cycle creation=", res); 
            cycleDeffered.resolve(res);                                
        }, function(err){
            console.log("Error in create cycle");
            cycleDeffered.reject(err);            
        });                
    return cycleDeffered.promise;    
}

var create = function(req, res, callback) {
    var  projects = require('../controllers/projects.controller');
    console.log("create method get called", req);
    createProjectDeffered = Q.defer();
    projects.create(req, {
                statusCode: null,
                send: function(project) {
                    if( this.statusCode != 400 ) {
                        console.log('project::', project);
                        callback(req.body.cycle_id);
                    }
                },
                status: function(statusCode) {
                    this.statusCode = statusCode;
                }})            
};

var createProjectWithQ = function(request){
    var  projects = require('../controllers/projects.controller');
    var responseToSend = {
        statusCode: null,
        send: function(project) {
            if( this.statusCode != 400 ) {
                console.log('project::', project);
                //callback(req.body.cycle_id);
            }
        },
        status: function(statusCode) {
            this.statusCode = statusCode;
        }
    }
    createProjectPromise = Q.defer();
    projects.create(request, responseToSend)
        .then(function(res){
            createProjectPromise.resolve(res);
        }, function(error){
            createProjectPromise.reject(error);
        });
    return createProjectPromise.promise;    
};

var createProspectWithQ = function(email){
    var deffered = Q.defer();
    getNewProspectDetails(email)
        .then( function(prospect){
            //console.log("create prospect with Q", prospect);
            deffered.resolve(prospect);   
        }, function(error){
            console.log("Error in create prospect with Q===", error);
            deffered.reject(error);
        });
        return deffered.promise;
}; 

var createProspect = function(mail){
    console.log("Create prospect called"); 
    deffered = Q.defer();
    createProspectWithQ(mail)
        .then(function(newProspect){
            //console.log("Create prospect=", newProspect);       
            var newCycle = {};
            newCycle._id = datetimehelpers.getUniqueTime();
            newProspect.cycle_id = newCycle;

            var req = {
                "body" : newProspect
            };

            var res = {
                "flag": "1",
                send: function(project) {
                    console.log('project::', project);
                },
                status: function(statusCode) {
                    if (statusCode == 200){ 
                        console.log("Prospect created successfully");
                    }    
                    else{
                        //
                    }
                }
            };            
            deffered.resolve(req, res);             
        }, function(error){
            console.log("Error in create prospect=", error);
            deffered.reject(error);
        });
        return deffered.promise;    
}

var checkProspectName = function(email, prospects){
    var name = getProspectNameFromEmail(email);
    console.log("subject to check", name);
    console.log("in callback function body", prospects.length);
    for(i=0; i<prospects.length; i++){
        prospect = prospects[i];
        if (string(prospect.name.toLowerCase()) == name.toLowerCase()){
            console.log("Prospect matched=", prospect);
            return true;
        }
    }
}

var checkProspectAvailability = function(email, callback){
    var  projects = require('../controllers/projects.controller');
       
    var projectList = new Array;
    projects.list(req, {
        statusCode:null,
        send: function(body){
            
            return callback(email, body);
        },
        status: function(statusCode){
            this.statusCode=statusCode;            
        }
    });        
}

var search = function(email){
    console.log("Email = ", email);
    console.log("references=", typeof email.references);
    console.log("in-reply-to=", typeof email.inReplyTo);
    if ((! email.references) && (! email.inReplyTo)) {
        console.log("Catched the first email");
        deffered = Q.defer();
        var fact = ruleengine.prepareFact(email.subject, email.subject)
        ruleengine.executeNodeRules(fact, function(found) {
            if (!found) {
                fact = ruleengine.prepareFact(email.subject, email.text);
                ruleengine.executeNodeRules(fact, function(found) {
                    if (found){
                        createProspect(email)
                            .then(function(req, res){
                                console.log("in else Search method to create prospect");
                                createProspectDeffered = Q.defer();
                                createProspectDeffered.resolve(req, res);
                                return createProspectDeffered.promise;                                
                            }, function(err){
                                console.log("Error in search method while creating prospect", error);
                                createProspectDeffered.reject(error);
                            })
                            .then(function(req, res){
                                createCycleWithQ(req, res)
                                        .then(function(request){
                                            createProjectWithQ(req)
                                                .then(function(project){
                                                    console.log("in create promise project got created", project);        
                                                },function(err){
                                                    console.log("error in project creation");
                                                });
                                        },function(error){
                                            console.log("error in create cycle");
                                        });
                            });
                    }                        
                    else{ 
                    	//
                    }
                });
            }else {
                createProspect(email)
                    .then(function(req, res){
                        console.log("in else Search method to create prospect");
                        createProspectDeffered = Q.defer();
                        createProspectDeffered.resolve(req, res);
                        return createProspectDeffered.promise;                        
                    }, function(err){
                        console.log("Error in search method while creating prospect", error);
                        createProspectDeffered.reject(error);
                    })
                    .then(function(req, res){
                        createCycleWithQ(req, res)
                                .then(function(request){
                                    createProjectWithQ(req)
                                        .then(function(project){
                                            console.log("in create promise project got created", project);        
                                        },function(err){
                                            console.log("error in project creation");
                                        });
                                },function(error){
                                    console.log("error in create cycle");
                                });
                    });
            }
        });
    }
    else{
        console.log("references=", email.references== undefined);
        console.log("in-reply-to=", email.inReplyTo);
    }
}

//checkProspectAvailability(email, checkProspectName);

exports.emailSubjectSearch = search;
//exports.createProspectNameFromEmail = generateProspectNameFromEmail;