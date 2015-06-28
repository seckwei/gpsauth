package controllers;

import java.util.Iterator;
import java.util.List;

import models.Border;
import models.Client;
import models.User;

import com.fasterxml.jackson.databind.JsonNode;

import play.Logger;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.libs.F.Promise;
import play.mvc.Controller;
import play.mvc.Result;
import utils.GeoCoordinates;

public class Authenticate extends Controller  {
	
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
			String clientid = json.findPath("clientid").textValue();
			
			Logger.info("Incoming authentication request: user:"+username+" for clientid:"+clientid);
			
			//look for the user and client
			Promise<Client> clientPromise = Promise.promise(()-> ClientController.get(username));
			Promise<User> userPromise;
			
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
			
			double distance;
			
			try
			{
				latlng = json.findPath("latlng").textValue().split(":");
				Logger.info("latlng:"+latlng);
			}
			catch (Exception e)
			{
				
			}
			
			//ping to mobile app to get coordinate
			
			
		}
		
		return ok();
	}
	
	public String pingMobile(String clientid, String username)
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

}
