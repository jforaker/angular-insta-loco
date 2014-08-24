
angular.module( 'ngBoilerplate.home', [	'google-maps',

	'ui.router',
	'plusOne'
])


	.config(function config( $stateProvider ) {
		$stateProvider.state( 'home', {
			url: '/home',
			views: {
				"main": {
					controller: 'HomeCtrl',
					templateUrl: 'home/home.tpl.html'
				}
			},
			data:{ pageTitle: 'Home' },
			resolve: {
				search: function($stateParams, Instagram) {
					var markers = [];

					return Instagram.get(33, 40.72, 73.99).success(function(response) {
						for (var i = 0; i < response.data.length; i++) {
							var image = response.data[i];
							markers.push(i, image)
						}
					});
				}
			}
		});
	})


	.controller( 'HomeCtrl', function HomeController( $scope, $timeout, Instagram, search ) {
		var searchdata = search.data.data;
		var markers = [];

		console.log(searchdata);

		$scope.randomMarkers = [];
		$scope.mapInstance = {};
		$scope.insta = {
			query: 'nyc'
		};
		$scope.map = {
			control: {},
			center: {
				latitude: 40.72,
				longitude: -73.99
			},
			zoom: 13,
			bounds: {},
			dragging: false,
			mexiMarkers: [],
			clickMarkers: [],
			dynamicMarkers: [],
			randomMarkers: [],
			disableAutoPan: true,
			options: {
				streetViewControl: false,
				panControl: false,
				disableAutoPan: true,
				maxZoom: 15,
				minZoom: 3
			},
			events: {
				tilesloaded: function (map) {
				},
				click: function (mapModel, eventName, originalEventArgs) {
					// 'this' is the directive's scope
//					console.log("user defined event: " + eventName, mapModel, originalEventArgs);
//					$scope.mapInstance = $scope.map.control.getGMap();
//					var center = $scope.map.control.getGMap().getCenter();
//					var e = originalEventArgs[0];
//					var lat = e.latLng.lat(),
//						lon = e.latLng.lng();
//
//					console.log(center + ' ' + lat + ' ' + lon);
//					//scope apply required because this event handler is outside of the angular domain
//					$scope.$apply();
				}
			}
		};

		$scope.doSearch = function (q) {
			Instagram.q(33, q).success(function(response) {
				console.log(response);
				var arr = [];
				for (var i = 0; i < response.data.length; i++) {
					var image = response.data[i];
					if(image.location){
						arr.push(createMarker(i, image))
					}
				}
				$scope.randomMarkers = arr;
				instagramSuccess($scope.insta, response);
			});
		};

		var createMarker = function (i, img, idKey) {
			if (idKey == null) {idKey = "id";}
			var ret = {
				id: img.id,
				icon: 'assets/images/blue_marker.png',
				latitude: img.location ? img.location.latitude : '',
				longitude: img.location ? img.location.longitude : '',
				data: img,
				show: false,
				disableAutoPan: true,
				options: {
					disableAutoPan: true
				}
			};
			ret.onClick = function() {ret.show = !ret.show;};
			ret[idKey] = i;
			return ret;
		};

//		$timeout(function(){
//			searchdata.forEach(function(data, i){
//				$scope.randomMarkers.push(createMarker(i*100, data));
//			});
//		},2000);


		var instagramSuccess = function(scope, res) {
			if (res.meta.code !== 200) {
				scope.error = res.meta.error_type + ' | ' + res.meta.error_message;
				return;
			}
			if (res.data.length > 0) {
				scope.items = res.data;
			} else {
				scope.items = '';
				scope.error = "No results. Try a place where people go.";
			}
		};

			Instagram.get(33, 40.72, 73.99).success(function(response) {
				instagramSuccess($scope.insta, response);
			});

		$scope.$watch(function() {
			return $scope.map.bounds;
		}, function(nv, ov) {

			if (ov.southwest && nv.southwest) {

				var newCenter = {
					lat: $scope.map.control.getGMap().getCenter().k,
					lon: $scope.map.control.getGMap().getCenter().B
				};
				console.log($scope.map.control.getGMap().zoom);

				Instagram.get(33, newCenter.lat, newCenter.lon).success(function(response) {
					for (var i = 0; i < response.data.length; i++) {
						var image = response.data[i];
						markers.push(createMarker(i, image))
					}
					$scope.randomMarkers = markers;
					instagramSuccess($scope.insta, response);
				});
			}
		}, true);
	})

	.factory('Instagram', function($http) {
		var base = 'https://api.instagram.com/v1';
		var clientId = '38c211bd41f74151ad5cdf0ae0de2bb7';
		return {
			'get': function(count, lat, lon) {
				var req = '/media/search?lat=' + lat + '&lng=' + lon + '&distance=4000';
				var url = base + req;
				var config = {
					'params': {
						'client_id': clientId,
						'count': count,
						'callback': 'JSON_CALLBACK'
					}
				};
				return $http.jsonp(url, config);
			},
			'q': function(count, q) {
				var req = '/tags/' + q + '/media/recent?';
				var url = base + req;
				var config = {
					'params': {
						'client_id': clientId,
						'count': count,
						'callback': 'JSON_CALLBACK'
					}
				};
				return $http.jsonp(url, config);
			}
		};
	})

;

