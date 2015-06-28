package controllers;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;

import models.Auth;
import models.Border;
import models.Client;
import models.User;

import com.fasterxml.jackson.databind.JsonNode;
import com.sun.javafx.runtime.SystemProperties;

import play.Logger;
import play.Play;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.mvc.*;
import play.libs.F.Function;
import play.libs.F.Promise;
import play.libs.Akka;
import play.libs.Json;
import play.libs.ws.WSClient;
import play.libs.ws.WSRequest;
import play.libs.ws.WSResponse;
import utils.GeoCoordinates;
import utils.GeoData;
import jsonobject.GCMmessage;
import jsonobject.GCMmessage.data;
import jsonobject.ResponseMessage;


import scala.concurrent.duration.Duration;
import scala.concurrent.duration.Deadline;


public class Authenticate extends Controller  {

	@Inject WSClient ws;
	
	@Transactional (readOnly =true)
	public Result respondserver(String username)
	{
		ResponseMessage msg = new ResponseMessage();
		msg.username = username;
		try
		{
			Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.username='"+username+"'").getSingleResult();
			msg.success = auth.success;
		}
		catch (Exception e)
		{
			msg.success = "fail";
		}
		
		return ok(Json.toJson(msg));
	}

	@Transactional
	public Result reply()
	{
		JsonNode json = request().body().asJson();

		if (json == null){
			return badRequest("No json data");
		}
		else
		{
			String secret = json.findPath("secret").textValue();
			String username = json.findPath("username").textValue();
			String[] coord = json.findPath("coord").textValue().split(":");

			User user = UserController.get(username);

			if (!user.secret.equals(secret))
			{
				return badRequest("Incorrect secret!");
			}

			try
			{
				Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.username='"+username+"'").getSingleResult();
				
				auth.success = "sucess";
				//Check whether the ip address match
				if (auth.latlng != null)
				{
					double distance = GeoData.distance(Double.parseDouble(coord[0]), Double.parseDouble(coord[1]),Double.parseDouble(auth.latlng[0]), Double.parseDouble(auth.latlng[1]),'k');
					
					if (distance >= 0.5)
					{
						auth.success = "fail";
					}	
				}
				
				
				
				JPA.em().persist(auth);
			}
			catch (Exception e)
			{
				Logger.info("ALready expired");
				return badRequest("Already expired");
			}
		}
		return ok();
	}

	@Transactional
	public static void expire(String username)
	{
		try
		{
			Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.username='"+username+"'").getSingleResult();

			JPA.em().remove(auth);

		}catch (Exception e)
		{

		}
	}

	@Transactional
	public Result auth()
	{
		JsonNode json = request().body().asJson();

		if (json == null){
			return badRequest("Expecting Json data");
		}
		else
		{
			boolean isauth = true;

			String username = json.findPath("username").textValue();
			String clientusername = json.findPath("clientid").textValue();
			String respondurl = json.findPath("respondurl").textValue();

			Logger.info("Incoming authentication request: user:"+username+" for clientusername:"+clientusername);

			//look for the user and client
			Promise<Client> clientPromise = Promise.promise(()-> ClientController.get(clientusername));
			Promise<User> userPromise = Promise.promise(()-> UserController.get(username));

			Client client = clientPromise.get(1000);
			User user = userPromise.get(1000);

			//ping to mobile app to get coordinate
			if (client.id == null && user.id == null)
			{
				return badRequest("No such user exist");
			}
			Promise<String> googleResponse=send_notification(user.gcm_regid,"data");

			String ip="";
			String[] latlng = null;
			try
			{
				ip = json.findPath("ipaddress").textValue();
				Logger.info("ip address :"+ ip);
			}
			catch (Exception e)
			{

			}
			try
			{
				latlng = json.findPath("latlng").textValue().split(":");
				Logger.info("latlng:"+latlng);
			}
			catch (Exception e)
			{

			}

			//Put the data into the database
			Auth auth = new Auth();
			auth.clientusername = client.username;
			auth.ipaddress = ip;
			auth.latlng = latlng;
			auth.success="pending";
			JPA.em().persist(auth);
			
			//Set a scheduler to remove the entry if it is timeout
			Akka.system().scheduler().scheduleOnce(
		            Duration.create(120, TimeUnit.SECONDS),
		            () -> {expire(client.username); Logger.info("Entry timedout!");},
		            Akka.system().dispatcher()
		    );

		}

		return ok();
	}

	public String pingMobile(String gcmid)
	{
		String latlng="";



		return latlng;
	}

	@Transactional(readOnly = true)
	public boolean checkAllBoundary(String clientid, String latlng)
	{
		boolean within = true;

		//Get the boundaries details
		List<Border> borders = (List<Border>) JPA.em().createQuery("select p from Border p where p.clientid="+clientid).getResultList();

		if (borders.isEmpty())
		{
			return true;
		}

		Iterator it = borders.iterator();

		while(it.hasNext())
		{
			Border border= (Border)it.next();

			String[] LatLngs = border.coordinates.split(";");

			if (!GeoCoordinates.InsidePolygon(LatLngs, latlng))
			{
				return false;
			}
		}

		return within;
	}

	public Promise<Result> test(String gcmid,String msg)
	{
		Promise<String> test = send_notification(gcmid,msg);
		return test.map(value -> ok(value));
	}

	public Promise<String> send_notification(String registration_id,String payload)
	{
		Logger.info("Sending message to GCM");

		Logger.info("key:"+Play.application().configuration().getString("google.gcm.api"));
		
		WSRequest wsrequest = ws.url(Play.application().configuration().getString("google.gcm.url"))
				.setHeader("Authorization","key="+Play.application().configuration().getString("google.gcm.api"))
				.setContentType("application/json");

		GCMmessage message = new GCMmessage();
		GCMmessage.data data = message.new data();
		message.to = registration_id;
		data.payload = payload;

		JsonNode messageJson = Json.toJson(message);

		Promise<String> responsePromise = wsrequest.post(messageJson).map(response-> {			
			int status = response.getStatus();

			Logger.info("Status:"+status);
			String body = response.getBody();
			Logger.info("Body:"+body);

			return body;
		});

		return responsePromise;
	}

}
