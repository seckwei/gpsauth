var login = {

	submit: function(){

		var obj = {
			username : $("#username").val(),
			clientid : "innovationwarehouse",
			latlng 	 : latlng,
			random	 : login.generator(),
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
	},

	generator: function(){

		var text = "";

		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 6; i++ ){
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    return text;
	}
};