'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:ProspectEditCtrl
 * @description
 * # ProspectEditCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('ProspectEditCtrl', function ($scope, $state, $stateParams, ProspectService, Emails, auth, CyclesService) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    if($stateParams.prospectId)
    {
    	ProspectService.getProspect($stateParams.prospectId)    
      .success (function (data){
      $scope.prospect = data;
      console.log(data);
      $scope.newProspect = JSON.parse(JSON.stringify($scope.prospect));
    })
      .error (function (error){
      console.log (error.msg);});
    }
    
    $scope.updateProspect = function (newProspect) {
      newProspect = newProspect || {};

      $scope.newProspect = {};

      if(newProspect._id) {
        ProspectService.updateProspect(newProspect);
      }else
      {

        newProspect._id = getUniqueTime();
        ProspectService.addProspect(newProspect);

          //create cycle
          var newCycle = {};
          newCycle._id = getUniqueTime();
          newCycle.no = 1;
          newCycle.status = "In progress";
          newCycle.prospect_id = newProspect._id;
          newCycle.prospect = newProspect.name;
          var d = new Date();
          newCycle.start_date = d.toLocaleString();
            CyclesService.addCycle(newCycle);

      //send email
        if(newProspect.sendEmail)
      	  {
      	    var newEmail = {};
              var subject = "Presale Prospect: "+newProspect.name;
              var from = auth.profile.name;
              var from_name = auth.profile.name;
              newEmail.send_date = d.toLocaleString();
      	      //newEmail.send_date = new Date().toDateString();
      	      newEmail.to = presale_email_id;
      	      newEmail.cycle_no = 1;
      	      newEmail.cycle_id = newCycle._id;
              newEmail.contents = subject + " is initialized." + " \r\nProspect Description: "+newProspect.description + " \r\nComments: "+ newProspect.othercomments;
      	    Emails.sendEmail(newEmail, from, from_name, subject, newProspect._id,1);
      	  }
      }
      $state.transitionTo('auth.prospect.view', {prospectId: newProspect._id});
    };

    $scope.cancelUpdate = function() {
      $scope.newProspect = JSON.parse(JSON.stringify($scope.prospect));

    };
    $scope.addUniqueItem = function (collection, item) {
      collection = collection || [];
      if (-1 === collection.indexOf(item)) {
        collection.push(item);
      }
    };

  });
