package models;

import javax.persistence.*;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
	public String id;

    public String username;
    public String secret;
    
    
}
