package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Auth {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	public String id;
	
	public String respondurl;
	public String username;
	public String clientusername;
	public String ipaddress;
	public String latlng;
	public int accuracy;
	public String success;
	public String random;

}
