var login = {

	url : "http://172.16.7.243:9000/",

	submit: function(){

		var rand = login.generator()

		var obj = {
			username : $("#username").val(),
			clientid : "innovationwarehouse",
			latlng 	 : latlng,
			random	 : rand,
		}

		console.log(JSON.stringify(obj));

		$.ajax({
			type: "POST",
		    url: login.url + "auth",
		    data: JSON.stringify(obj),
		    dataType: "json",
		    contentType: "application/json; charset=utf-8",
		    success: function(result){
		    	console.log("Login results",result);
		    },
		    error: function(XMLHttpRequest, textStatus, errorThrown) {
		    	console.log(XMLHttpRequest, textStatus, errorThrown);
		    	login.ping(rand)
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
	},

	ping: function(rand){
		console.log("called ping");

		var interval = setInterval(function(){
			console.log(login.url + "auth/check/" + rand);
			$.ajax({
				type: "GET",
			    url: login.url + "auth/check/" + rand,
			    success: function(result){

			    	console.log("Returned result",result)
					var r = JSON.parse(result);				
					console.log("Parsed JSON", r);

					if(r.success == "success"){
						clearInterval(interval);
						login.succeeded();
					}
					else if(r.success == "fail"){
						clearInterval(interval);
						login.failed();
					}
			    	else {
			    		console.log("Still trying...")
			    	}
			    },
			    error: function(XMLHttpRequest, textStatus, errorThrown) {
			       clearInterval(interval);
			       console.log(XMLHttpRequest, textStatus, errorThrown);
			    }
			});
		},2000);
	}


};