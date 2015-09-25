var config = require('../config/config-dev');
var string = require('string');

exports.searchWord = function(object){
/*
Here object is of type node-rules fact for more https://github.com/mithunsatheesh/node-rules/wiki/Facts
fact = {
	"name":"someName",
	"searchString": "searchString"
}
*/ 
    var searchString = object.searchString;  
    //console.log("subject of email="+ subject);
    var found = false;
    var search_keywords = config.search_keywords;
    for(i=0; i<search_keywords.length; i++){
        var searchword = search_keywords[i];
        //console.log("search keyword="+searchword);                
        found = string(searchString.toLowerCase()).contains(searchword.toLowerCase());
        console.log("found="+found);
        if (found) {
           //object.result = true;
           var stringArray = string(searchString.toLowerCase()).split(searchword.toLowerCase());
           
           return found;
        }                                
    }
    return found; 
}