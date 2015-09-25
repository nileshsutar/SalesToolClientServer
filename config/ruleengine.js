//import the package
var RuleEngine = require('node-rules');
var search = require("../helpers/search");

//define the rules
var rules = [{
    "condition": function(R) {
        this.result = false;
        console.log('Search Started>>', this.searchString);
        var wordfound = search.searchWord(this);

        if (wordfound) {
            this.result = true;
            R.stop();
        }
        console.log('this>>', this);
        console.log('wordfound>>', wordfound);

        //R.when(this && wordfound);
    },
    "consequence": function(R) {
        console.log("result value:"+ this.result);
        //this.result = false;
        R.stop();
    }
}];

/*as you can see above we removed the priority 
and on properties for this example as they are optional.*/ 

//initialize the rule engine
var R = new RuleEngine(rules);

//Now pass the fact on to the rule engine for results
var executeRules = function(fact, onComplete) {
    R.execute(fact, function(result){ 
        if(result.result){
            console.log("\n-----Keyword found in email subject----\n");
            onComplete(result.result);
        }
        else { 
            console.log("\n-----Keyword not found in email subject----\n");
            nComplete(result.result);
        }
    });  
};

//sample fact to run the rules on
exports.prepareFact = function(name, searchString){
    var fact = {
        "name": name,
        "searchString": searchString,        
    };
    return fact;
}

exports.executeNodeRules = function(fact, onComplete){
    return executeRules(fact, onComplete);
}