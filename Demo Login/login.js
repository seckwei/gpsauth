var login = {

	submit: function(){

		var obj = {
			username : $("#username").val(),
			clientid : "innovationwarehouse",
			coord : navigator.geolocation.getCurrentPosition(function(position) {
					return position.coords.latitude+","+position.coords.longitude;
					});
		}

		console.log(JSON.stringify(obj));

		$.ajax({
			type: "POST",
		    url: "http://192.168.15.181:9000/auth",
		    data: JSON.stringify(obj),
		    dataType: "json",
		    contentType: "application/json; charset=utf-8",
		    success: function(result){
		      console.log(result);
		    },
		    error: function(XMLHttpRequest, textStatus, errorThrown) {
		       console.log(XMLHttpRequest, textStatus, errorThrown);
		    }
		});
	}
};

