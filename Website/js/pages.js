
var pages = angular.module('pages', ['ngRoute', 'structure']);

pages.config(['$routeProvider', 'featuresProvider', function(rp, fp){

    angular.forEach(fp.list, function(feature){ // value, key, obj

        rp.when(feature.url , {
            templateUrl  : feature.templateUrl,
            controller   : feature.controller,
            controllerAs : feature.controllerAs,
            resolve : {
                data : function(){
                    return {
                        title: function () {
                            return feature.title;
                        }
                    }
                }
            }
        });
    });

}]);


/*pages.directive('dashboard', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/dashboard.html',
        controller: function(){

        },
        controllerAs: ''
    };
});

pages.directive('charts', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/charts.html',
        controller: function(){

        },
        controllerAs: ''
    };
});

pages.directive('tables', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/tables.html',
        controller: function(){

        },
        controllerAs: ''
    };
});

pages.directive('forms', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/forms.html',
        controller: function(){

        },
        controllerAs: ''
    };
});

pages.directive('bootstrapElements', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/bootstrap-elements.html',
        controller: function(){

        },
        controllerAs: ''
    };
});

pages.directive('bootstrapGrid', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/bootstrap-grid.html',
        controller: function(){
        },
        controllerAs: ''
    };
});

pages.directive('blankPage', function(){
    return {
        restrict: 'E',
        templateUrl: '../pages/blank-page.html',
        controller: function(){
        },
        controllerAs: ''
    };
});*/


/*

pages.directive('', function(){
	return {
		restrict: '',
		templateUrl: '',
		controller: function(){
			
		},
		controllerAs: ''
	};
});

*/