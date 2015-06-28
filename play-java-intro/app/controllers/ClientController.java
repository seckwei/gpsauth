package controllers;

import static play.libs.Json.toJson;

import java.util.List;

import models.Border;
import models.Client;
import models.PendingUser;

import com.fasterxml.jackson.databind.JsonNode;

import play.Logger;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;

public class ClientController extends Controller {
	
	public Result border(){
		JsonNode json = request().body().asJson();
		if (json == null){
			return badRequest("Expecting Json data!");
		}
		else
		{
			String clientid = json.findPath("clientid").textValue();
			JsonNode coords = json.get("coords");
			
			String borderstr ="";
			
			if (coords.isArray())
			{
				for (final JsonNode obj: coords)
				{
					String test = obj.asText();
					
					Logger.info("Info: "+test);
					
					borderstr+= test +";";
				}
			}
			
			//Remove the trailing ;
			borderstr = borderstr.substring(0, borderstr.length()-1);
			addBorder(borderstr,clientid);
		}
		return ok("Success!");
	}

	@Transactional
	public static void addBorder(String borderstr, String clientid)
	{
		Client client = JPA.em().find(Client.class,clientid );
		
		Border border = new Border();
		border.client = client;
		border.coordinates = borderstr;
		
		JPA.em().persist(border);
	}
	
	@Transactional(readOnly = true)
	public Result getClient()
	{
		List<Client> clients = (List<Client>) JPA.em().createQuery("select p from Client p").getResultList();
        return ok(toJson(clients));
	}
}
