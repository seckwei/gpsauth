package models;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class Border {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	public String id;
	
	public String coordinates;
	
	
	@ManyToOne(fetch = FetchType.EAGER, cascade=CascadeType.ALL)
	@JoinColumn(name="client_id")
	@JsonBackReference
	public Client client;
	
}
