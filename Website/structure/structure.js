var features = [
	{
		title 		: 'Dashboard',
		url   		: 'dashboard',
		templateUrl : 'pages/dashboard.html',
		controller  : function(title){
			return function(){
				this.title = title;
			}
		},
		controllerAs : 'dashboardCtrl',
		icon  		: 'fa fa-fw fa-dashboard'
	},
	{
		title 		: 'Map & Bounds',
		url   		: 'maps',
		templateUrl : 'pages/maps/maps.html',
		controller  : function(title){
			return function(){
				this.title = title;
			}
		},
		controllerAs : 'mapsCtrl',
		icon  		: 'fa fa-fw fa-map-marker'
	},
	{
		title 		: 'Login & Registration',
		url   		: 'login',
		templateUrl : 'pages/mock-login/mock-login.html',
		controller  : function(title){
			return function(){
				this.title = title;
			}
		},
		controllerAs : 'loginCtrl',
		icon  		: 'fa fa-fw fa-sign-in'
	},
	/*{
		title : 'Charts',
		icon  : 'fa fa-fw fa-bar-chart-o'
	},
	{
		title : 'Tables',
		icon  : 'fa fa-fw fa-table'
	},
	{
		title : 'Forms',
		icon  : 'fa fa-fw fa-edit'
	},
	{
		title : 'Bootstrap Element',
		icon  : 'fa fa-fw fa-desktop'
	},
	{
		title : 'Bootstrap Grid',
		icon  : 'fa fa-fw fa-wrench'
	},
	{
		title : 'Dropdown',
		icon  : 'fa fa-fw fa-arrows-v',
		dropdownID : 'demo',
		dropdownIcon : 'fa fa-fw fa-caret-down',
		dropdowns : [
			{
				title : 'Dropdown #1',
				icon  : '"fa fa-fw fa-arrows-v'
			},
			{
				title : 'Dropdown #2',
				icon  : '"fa fa-fw fa-arrows-v'
			},
		]
	},
	{
		title : 'Blank Page',
		icon  : 'fa fa-fw fa-file'
	}*/
];

(function(){
	var structure = angular.module('structure', []);

	structure.directive('brandMobileNavi', function(){
		return {
			restrict: '',
			templateUrl: 'structure/brand-mobile-navi.html',
			controller: function(){

			},
			controllerAs: ''
		};
	});

	structure.directive('topMenu', function(){
		return {
			restrict: '',
			templateUrl: 'structure/top-menu.html',
			controller: function(){

			},
			controllerAs: ''
		};
	});

	structure.directive('leftBar', function(){
		return {
			restrict: '',
			templateUrl: 'structure/left-bar.html',
			controller: function(){
				this.menu = 0;
				this.features = features;

				this.setMenu = function(val){
					this.menu = val;
					//console.log(this.menu);
				};

				this.isSet = function(val){
					return this.menu === val;
				};
			},
			controllerAs: 'lbCtrl'
		};
	});

	

})();