package models;

import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class Client {

    @Id
    @Column(name="client_id")
    @GeneratedValue(strategy=GenerationType.AUTO)
	public String id;

    public String username;
    public String password;
    
    @OneToMany (mappedBy="client",fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Column(nullable = true)
    @JsonManagedReference
    public List<Border> borders;
    
    
}
