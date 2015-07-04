(function(){
	var pages = angular.module('pages', ['ngRoute']);

	pages.config(function($routeProvider){
		
		for(ind in features){
			$routeProvider.when('/'+ features[ind].url ,{
				templateUrl  : features[ind].templateUrl,
				controller   : features[ind].controller(features[ind].title),
				controllerAs : features[ind].controllerAs
			});

		}

		/*$routeProvider

		.when('/dashboard',{
			templateUrl : '../pages/dashboard.html',
			controller: ''
		})

		.when('/maps',{
			templateUrl : '../pages/maps/maps.html',
			controller: ''
		})

		.when('/login',{
			templateUrl : '../pages/mock-login/mock-login.html',
			controller: ''
		})*/
	});


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

})();

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