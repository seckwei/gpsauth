package controllers;

import static play.libs.Json.toJson;

import java.util.List;

import org.apache.commons.lang3.RandomStringUtils;

import models.Client;
import models.PendingUser;
import models.User;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import play.*;
import play.mvc.*;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.libs.Json;


public class UserController extends Controller {
	
	@Transactional
	public Result register()
	{
		JsonNode json = request().body().asJson();
		//response().setHeader("Access-Control-Allow-Origin", "*");	
		if (json == null){
			return badRequest("Expecting Json data!");
		}
		else
		{
			String username = json.findPath("username").textValue();
			String clientid = json.findPath("clientid").textValue();
			
			try
			{
				User user = UserController.get(username);
			}
			catch (Exception e)
			{
				
			}
						
			//Randomly generate a random string for activation code
			//RandomString random = new RandomString();
			String activationcode = RandomStringUtils.randomAlphanumeric(7);
			
			Logger.info("Incoming newuser: username:"+username+" clientid:"+clientid+" code:"+activationcode);
			
			//Store the value in our database
			PendingUser user = new PendingUser();
			user.username = username;
			user.code = activationcode;
			JPA.em().persist(user);
			
			ObjectNode result = Json.newObject();
			result.put("username", username);
			result.put("activationcode", activationcode);
			
			return ok(result);
		}
	}
	
	@Transactional(readOnly = true)
    public Result getPending() {
        List<PendingUser> pendings = (List<PendingUser>) JPA.em().createQuery("select p from PendingUser p").getResultList();
        return ok(toJson(pendings));
    }
	
	@Transactional(readOnly = true)
	public static User get(String username)
	{
		return (User)JPA.em().createQuery("select p from User p where p.username='"+username+"'").getSingleResult();
	}

}
