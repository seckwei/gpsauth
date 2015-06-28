package controllers;

import static play.libs.Json.toJson;

import java.util.List;

import models.Border;
import models.Client;
import models.PendingUser;
import models.Person;

import com.fasterxml.jackson.databind.JsonNode;

import play.Logger;
import play.data.Form;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.*;

public class ClientController extends Controller {
	
	@Transactional
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
	public Result add()
	{
		Client client = Form.form(Client.class).bindFromRequest().get();
		
		List<Client> resultset = (List<Client>) JPA.em().createQuery("select p from Client p where p.username='"+client.username+"'").getResultList();
		
		if (resultset.size() == 0)
		{
			JPA.em().persist(client);
		}
		return redirect(routes.ClientController.index());
		
	}
	
	public Result index()
	{
		return ok(client.render());
	}

	@Transactional
	public void addBorder(String borderstr, String username)
	{	
		Client client = (Client)JPA.em().createQuery("select p from Client p where p.username='"+username+"'").getSingleResult();
		
		Border border = new Border();
		border.client = client;
		border.coordinates = borderstr;
		
		Logger.info(border.coordinates);
		
		JPA.em().persist(border);
	}
	
	@Transactional(readOnly = true)
	public static Client get(String username)
	{
		return (Client)JPA.em().createQuery("select p from Client p where p.username='"+username+"'").getSingleResult();
	}
	
	@Transactional(readOnly = true)
	public Result getBorder(String username)
	{
		Client client = (Client)JPA.em().createQuery("select p from Client p where p.username='"+username+"'").getSingleResult();	
		return ok(toJson(client.borders));
	}
	
	@Transactional(readOnly = true)
	public Result getClient()
	{
		List<Client> clients = (List<Client>) JPA.em().createQuery("select p from Client p").getResultList();
        return ok(toJson(clients));
	}
}
