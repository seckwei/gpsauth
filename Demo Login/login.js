var login = {

	rand : "",
	url : "http://172.16.7.243:9000/",

	submit: function(){

		rand = login.generator()

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
		      console.log(result);

		      login.ping();
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
	},

	ping: function(){

		var interval = setInterval(function(){
			console.log(login.url + "auth/check/" + login.rand);
			$.ajax({
				type: "GET",
			    url: login.url + "auth/check/" + login.rand,
			    success: function(result){

					var r = JSON.parse(results);					
					console.log("Returned", r);

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