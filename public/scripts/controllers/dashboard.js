'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the dashboardApp
 */
angular.module('dashboardApp')
  .controller('DashboardCtrl', function ($scope, $state, ProspectService) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    
    //calendar
    /*$scope.eventSources = [];
   
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };*/

        $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        $scope.chartData = {
            "labels": $scope.months,
            "series": ['Active', 'Converted'],
            "series1": ['Bay Area', 'East Coast'],
            "data":[],
            "data1":[]
        }

        var prospectList = ProspectService.getAllProspects()
            .success (function (data){
            $scope.projects = data;
            $scope.totalActiveProjects =  $scope.projects.length;
            $scope.totalEastCoastProjects =  $scope.projects.length;
            $scope.data = [];
            $scope.data1 = [];
            $scope.bayarea = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            $scope.eastcoast = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            $scope.active = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            $scope.converted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
           /* $scope.active = [$scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length,
                $scope.projects.length];*/
            $scope.projects.forEach(function(project){
                console.log("project::"+project.name);

                $scope.chartData.data = [];

                $scope.months.forEach(function (i, m) {

                    //for active vs converted
                    if((typeof project.end_date) == "string") {
                        var date1 = new Date(project.end_date);

                        if (date1.getMonth() == m) {
                            $scope.converted[m] = $scope.converted[m] + 1;
                            if(project.area == "Bay Area")
                            {
                                $scope.bayarea[m] = $scope.bayarea[m] + 1;
                            }else if(project.area == "East Coast")
                            {
                                $scope.eastcoast[m] = $scope.eastcoast[m] + 1;
                            }

                        }

                    }

                });

            });
            $scope.months.forEach(function (i, m) {
                $scope.active[m] = $scope.totalActiveProjects - $scope.converted[m];
                $scope.totalActiveProjects = $scope.totalActiveProjects - $scope.converted[m];
            });

            $scope.chartData.data.push([$scope.active,$scope.converted]);
            $scope.chartData.data1.push([$scope.bayarea,$scope.eastcoast]);
            console.log("data1" + $scope.chartData.data1[0]);

        })
            .error (function (error){
            console.log (error);}
        );

        //$scope.labels = ["Jan", "Feb", "Mar", "Apr", "May", "June","Jul","Aug","Sep","Oct","Nov","Dec"];
    //$scope.series = ['Active', 'Converted'];
    //$scope.data = dashboardService.getYearlyStats();

    /*$scope.data = [
      [65, 59, 84, 81, 56, 55, 90,23,45,45,77,66],
      [28, 48, 40, 19, 35, 27,78,44,34,56,65,44]
    ];*/

    $scope.colours =[
      { // yellow
        fillColor: "rgba(253,180,92,0.2)",
        strokeColor: "rgba(253,180,92,1)",
        pointColor: "rgba(253,180,92,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(253,180,92,0.8)"
      },
      { // blue
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
      }
    ];
    $scope.labels1 = ["Active", "Converted"];
    $scope.series1 = ['Active', 'Converted'];
    $scope.data1 = [58, 48 ];
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
      $state.transitionTo('auth.home');
    };
  });
