package controllers;

import play.*;
import play.mvc.*;
import play.mvc.Http.Response;
import play.db.jpa.*;
import views.html.*;
import models.Person;
import play.data.Form;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import static play.libs.Json.*;

public class Application extends Controller {

	public Result index() {
		return ok(index.render());
	}

	@Transactional
	public Result addPerson() {
		Person person = Form.form(Person.class).bindFromRequest().get();
		JPA.em().persist(person);
		return redirect(routes.Application.index());
	}

	@Transactional(readOnly = true)
	public Result getPersons() {
		List<Person> persons = (List<Person>) JPA.em().createQuery("select p from Person p").getResultList();
		return ok(toJson(persons));
	}
	
	public Result rootOptions()
	{
		return options("/");
	}
	
	public Result options(String url)
	{
		setHeader();
		Logger.info("Setted header");
		return ok();
	}

	public static void setHeader()
	{
		response().setHeader("Access-Control-Allow-Origin","*");
		response().setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, DELETE, PUT");
		response().setHeader("Access-Control-Max-Age","3600");
		response().setHeader("Access-Control-Allow-Headers","Origin, Content-Type, Accept, Authorization");
		response().setHeader("Access-Control-Allow-Credentials","true");
	}

	public Result test(){
		JsonNode json = request().body().asJson();
		if (json == null){
			return badRequest("Expecting Json data!");
		}
		else
		{
			String clientid = json.findPath("clientid").textValue();
			JsonNode coords = json.get("coords");
			
			if (coords.isArray())
			{
				for (final JsonNode obj: coords)
				{
					Logger.info("Info:"+obj);
				}
			}
		}
		response().setHeader("Access-Control-Allow-Origin", "*");
		return ok("Success!");
	}
}
