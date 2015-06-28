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
import play.data.Form;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.libs.Json;
import views.html.*;


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
			
			User user = null;
			
			try
			{
				user = UserController.get(username);
			}
			catch (Exception e)
			{
				
			}
				
			if (user == null)
			{
				return badRequest("Username already exist");
			}
			
			//Randomly generate a random string for activation code
			//RandomString random = new RandomString();
			String activationcode = RandomStringUtils.randomAlphanumeric(7);
			
			Logger.info("Incoming newuser: username:"+username+" clientid:"+clientid+" code:"+activationcode);
			
			//Store the value in our database
			PendingUser pending = new PendingUser();
			pending.username = username;
			pending.code = activationcode;
			JPA.em().persist(pending);
			
			ObjectNode result = Json.newObject();
			result.put("username", username);
			result.put("activationcode", activationcode);
			
			return ok(result);
		}
	}
	
	@Transactional
	public Result activate()
	{
		JsonNode json = request().body().asJson();
		if (json == null){
			return badRequest("Expecting Json data!");
		}
		else
		{
			String username = json.findPath("username").textValue();
			String activationcode = json.findPath("activationcode").textValue();
			String gcmreg_id = json.findPath("gcm_regid").textValue();
			
			PendingUser pending;
			try
			{
				pending = (PendingUser) JPA.em().createQuery("select p from PendingUser p where p.code='"+activationcode+"' and p.username='"+username+"'").getSingleResult();
			}
			catch (Exception e)
			{
				return badRequest("Incorrect activationcode");
			}
			
			//Remove the pending user
			JPA.em().remove(pending);
			
			//Create the actual user
			//Create a random secret
			String secret = RandomStringUtils.randomAlphanumeric(5);
			
			User newuser = new User();
			newuser.secret = secret;
			newuser.username= username;
			newuser.gcm_regid = gcmreg_id;
			JPA.em().persist(newuser);
			
			return ok(toJson(newuser));
			
		}
	}
	
	@Transactional (readOnly = true)
	public Result getallPending()
	{
		List<PendingUser> pendings = (List<PendingUser>) JPA.em().createQuery("select p from PendingUser p ").getResultList();
		return ok(Json.toJson(pendings));
	}
	
	@Transactional
	public Result addPending()
	{		
		PendingUser pending = Form.form(PendingUser.class).bindFromRequest().get();
		pending.code = RandomStringUtils.randomAlphabetic(5);
		
		JPA.em().persist(pending);
		
		return redirect(routes.UserController.pendingindex());
	}
	
	public Result pendingindex()
	{
		return ok(pendinguser.render());
	}
	
	@Transactional (readOnly = true)
	public Result getall()
	{
		List<User> users = (List<User>) JPA.em().createQuery("select p from User p").getResultList();
        return ok(toJson(users));
	}
	
	@Transactional(readOnly = true)
	public static User get(String username)
	{
		return (User)JPA.em().createQuery("select p from User p where p.username='"+username+"'").getSingleResult();
	}

}
