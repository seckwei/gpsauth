package utils;

import java.math.BigInteger;
import java.security.*;

public class RandomString {
	
	private SecureRandom random = new SecureRandom();
	
	public String get()
	{
		return new BigInteger(130,random).toString();
	}

}
