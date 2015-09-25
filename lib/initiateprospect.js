// imports packages
var datetimehelpers = require('../helpers/datetime');
var ruleengine = require("../config/ruleengine");

var getNewProspectDetails = function(email){
    var prospect = {};
    prospect._id = datetimehelpers.getUniqueTime();
    prospect.name = "TestSalesToolProspect";
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
    //prospect.cycle_id = {};
    return prospect;
}

var createCycle = function(newCycle){
    console.log("create cycle called");
    newCycle.cycle_no = 1;
    newCycle.status = "In progress";
    newCycle.prospect_id = newProspect._id;
    newCycle.prospect = newProspect.name;
    newCycle.current_state = newProspect.state_id;
    var d = new Date();
    newCycle.start_date = d.toDateString();

    var cycles = require('../controllers/cycles.controller');
    var response = {
        status: function(statusCode){
            if (statusCode != 400)
                console.log("cycle created successfully");
        }
    };
    var prospectCycle = {};
    prospectCycle.body = newCycle;
    //console.log("cycle request=", newCycle);
    cycles.create(prospectCycle, response);
    console.log("response after cycle creation=", response);
}

var create = function(req, res, callback) {
    var  projects = require('../controllers/projects.controller');

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
        }});    
}

var createProspect = function(mail){
    console.log("Create prospect called");    
    newProspect = getNewProspectDetails(mail);

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
    console.log("body of mail=", req.body);    
    create(req, res, createCycle);    
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
    var req = {
        //"name": project,
    };
    
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
        var fact = ruleengine.prepareFact(email.subject, email.subject)
        ruleengine.executeNodeRules(fact, function(found) {
            if (!found) {
                fact = ruleengine.prepareFact(email.subject, email.text);
                ruleengine.executeNodeRules(fact, function(found) {
                    if (found)
                        createProspect(email);
                    else{ 
                    	//
                    }
                });
            }else {
                createProspect(email);
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
