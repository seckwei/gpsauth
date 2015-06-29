package controllers;

import static play.libs.Json.toJson;

import java.util.ArrayList;
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
import play.data.Form;
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
import utils.GPSBorder;
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
	public Result respondserver(String random)
	{
		ResponseMessage msg = new ResponseMessage();
		try
		{
			Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.random='"+random+"'").getSingleResult();
			msg.success = auth.success;
			msg.username = auth.username;
			
			if(msg.success == "success")
			{
				JPA.em().remove(auth);
			}
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
			Logger.info("Incoming gps data from phone");
			Logger.info("Body:"+request().body());
			
			String secret = json.findPath("secret").textValue();
			String username = json.findPath("username").textValue();
			String coord = json.findPath("coord").textValue();
			String random = json.findPath("random").textValue();
			
			Logger.info("coord is"+coord);

			User user = UserController.get(username);

			/*
			if (!user.secret.equals(secret))
			{
				return badRequest("Incorrect secret!");
			}*/

			try
			{
				String[] coords = coord.split(",");
				Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.random='"+random+"'").getSingleResult();
				
				Logger.info("Got auth");
				auth.success = "sucess";
				//Check the distance of the two coordinates
				if (auth.latlng != null)
				{
					String[] latlng = auth.latlng.split(",");
					double lat = Double.parseDouble(latlng[0]);
					double lng = Double.parseDouble(latlng[1]);
					double coordlat = Double.parseDouble(coords[0]);
					double coordlon = Double.parseDouble(coords[1]);
					
					double distance = GeoData.distance(lat, lng,coordlat, coordlon,'k');
					//double distance = 0;
					
					Logger.info("Distance is "+distance+"km");
					
					if (distance >= 0.5)
					{
						auth.success = "fail";
					}	
				}
				
				//Check whether the borders
				boolean within = checkAllBoundary(auth.clientusername,coord);
				
				if(!within)
				{
					Logger.info("Not within distance");
					auth.success ="fail";
				}
				
				JPA.em().persist(auth);
			}
			catch (Exception e)
			{
				Logger.info(e.getMessage());
				Logger.info("ALready expired");
				return badRequest("Already expired");
			}
		}
		Logger.info("Success replied");
		return ok();
	}

	@Transactional
	public static void expire(String random)
	{
		try
		{
			Auth auth = (Auth)JPA.em().createQuery("select p from Auth p where p.random='"+random+"'").getSingleResult();

			JPA.em().remove(auth);
			Logger.info("Entry timedout!");

		}catch (Exception e)
		{

		}
	}

	@Transactional
	public Result auth()
	{
		JsonNode json = request().body().asJson();

		if (json == null){
			Logger.info("No json");
			return badRequest("Expecting Json data");
		}
		else
		{
			Logger.info("Body:"+request().body());
			
			String username = json.findPath("username").textValue();
			String clientusername = json.findPath("clientid").textValue();
			String respondurl = json.findPath("respondurl").textValue();
			String random = json.findPath("random").textValue();

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
			Promise<String> googleResponse=send_notification(user.gcm_regid,random);

			String ip="";
			String latlng = null;
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
				latlng = json.findPath("latlng").textValue();
				Logger.info("latlng:"+latlng);
			}
			catch (Exception e)
			{

			}

			//Put the data into the database
			Auth auth = new Auth();
			auth.clientusername = client.username;
			auth.username = user.username;
			auth.random = random;
			auth.ipaddress = ip;
			auth.latlng = latlng;
			auth.success="pending";
			JPA.em().persist(auth);
			
			//Set a scheduler to remove the entry if it is timeout
			Akka.system().scheduler().scheduleOnce(
		            Duration.create(120, TimeUnit.SECONDS),
		            () -> {expire(random); },
		            Akka.system().dispatcher()
		    );

		}

		return ok("auth!");
	}

	@Transactional(readOnly = true)
	public boolean checkAllBoundary(String clientid, String latlng)
	{
		boolean within = true;

		double lat = Double.parseDouble(latlng.split(",")[0]);
		double lon = Double.parseDouble(latlng.split(",")[1]);

		Logger.info("Checking boundary");
		Logger.info("lat: "+lat);
		Logger.info("lon:"+ lon);
		
		//Get the client
		Client client = ClientController.get(clientid);
		
		List<Border> borders = client.borders;
		
		if(borders.isEmpty())
		{
			Logger.info("boundary is empty");
			return true;
		}
		
		Iterator it = borders.iterator();

		while(it.hasNext())
		{
			Border border= (Border)it.next();

			String[] LatLngs = border.coordinates.split(";");

			ArrayList<String> polygon = new ArrayList<String>();
			
			for(int i=0; i< LatLngs.length; i++)
			{
				polygon.add(LatLngs[i]);
			}
			ArrayList<Double> lat_array = new ArrayList<Double>();
		    ArrayList<Double> long_array = new ArrayList<Double>();
		    
		    for(String s : polygon){
		        lat_array.add(Double.parseDouble(s.split(",")[0]));
		        long_array.add(Double.parseDouble(s.split(",")[1]));
		    }
			
		    if (!GPSBorder.coordinate_is_inside_polygon(lat, lon, lat_array, long_array))
		    {
		    	Logger.info("not within");
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
		data.message = payload;

		JsonNode messageJson = Json.toJson(message);
		
		String msg = "{\"to\" : \""+registration_id+"\",\"data\":{\"message\":\""+payload+"\"}}";
		
		Logger.info("MSG "+msg);
		
		Promise<String> responsePromise = wsrequest.post(msg).map(response-> {			
			int status = response.getStatus();

			Logger.info("Status:"+status);
			String body = response.getBody();
			Logger.info("Body:"+body);

			return body;
		});

		return responsePromise;
	}
	
	@Transactional (readOnly = true)
	public Result getAllAuth()
	{
		List<Auth> auth = (List<Auth>) JPA.em().createQuery("select p from Auth p").getResultList();
        return ok(toJson(auth));
	}


}
