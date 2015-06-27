package utils;

public class GeoCoordinates {
	
	public static boolean InsidePolygon(String[] border, String latlng)
	{
		int n = border.length;
		
		double angle = 0;
		
		for(int i=0; i<n; i++)
		{
			String[] point1 = border[i].split(":");
			String[] point2 = border[(i+1)%n].split(":");
			
			double p1h = Double.parseDouble(point1[0]);
			double p1v = Double.parseDouble(point1[1]);
			double p2h = Double.parseDouble(point2[0]);
			double p2v = Double.parseDouble(point2[1]);
			
			angle += Angle2D(p1h,p1v,p2h,p2v);
		}
		
		if (Math.abs(angle)< Math.PI)
			return false;
		else
			return true;
	}
	
	public static double Angle2D(double x1, double y1, double x2, double y2)
	{
		double dtheta, theta1, theta2;
		
		theta1 = Math.atan2(y1,x1);
		theta2 = Math.atan2(y2, x2);
		dtheta = theta2 - theta1;
		
		while(dtheta >Math.PI)
			dtheta -= 2*Math.PI;
		while(dtheta < -Math.PI)
			dtheta += 2*Math.PI;
		
		return dtheta;
	}
	
	public static double distance(double x1, double y1, double x2, double y2)
	{
		double distance;
		
		distance = Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2));
		
		return distance;
	}

}
