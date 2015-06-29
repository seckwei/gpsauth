var login = {

	submit: function(){

		var obj = {
			username : $("#username").val(),
			clientid : "innovationwarehouse"
		}

		console.log(JSON.stringify(obj));
		
		$.ajax({
			type: "POST",
			url: "http://localhost:9000/auth",
			data: JSON.stringify(obj),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(result){
			  alert("Success");
			  console.log(result);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
			   console.log(XMLHttpRequest, textStatus, errorThrown);
			}
		  });
	}
};