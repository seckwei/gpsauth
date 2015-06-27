package models;

import java.util.List;

import javax.persistence.*;

@Entity
public class Client {

    @Id
    @Column(name="client_id")
    @GeneratedValue(strategy=GenerationType.AUTO)
	public String id;

    public String username;
    public String password;
    
    @OneToMany (mappedBy="client")
    public List<Border> borders;
    
    
}
