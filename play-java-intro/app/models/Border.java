package models;

import javax.persistence.*;

@Entity
public class Border {

	@Id
	public String id;
	
	public String coordinates;
	
	@ManyToOne (fetch=FetchType.LAZY)
	@JoinColumn(name="client_id")
	public Client client;
	
}
