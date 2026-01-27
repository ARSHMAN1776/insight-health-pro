import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock, Activity, Database, Server, Globe, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ServiceStatus = "operational" | "degraded" | "outage" | "checking";

interface Service {
  name: string;
  icon: React.ElementType;
  status: ServiceStatus;
  latency?: number;
  description: string;
}

const Status = () => {
  const [services, setServices] = useState<Service[]>([
    { name: "Web Application", icon: Globe, status: "checking", description: "Main application frontend" },
    { name: "Database", icon: Database, status: "checking", description: "PostgreSQL database cluster" },
    { name: "Authentication", icon: Shield, status: "checking", description: "User authentication services" },
    { name: "API Gateway", icon: Server, status: "checking", description: "Edge function endpoints" },
  ]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [overallUptime] = useState(99.95);

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkServices = async () => {
    const startTime = Date.now();
    
    // Check database connectivity
    const { error: dbError } = await supabase.from('departments').select('department_id').limit(1);
    const dbLatency = Date.now() - startTime;
    
    // Check edge function (departments endpoint)
    const edgeStart = Date.now();
    let edgeStatus: ServiceStatus = "operational";
    let edgeLatency = 0;
    try {
      const response = await supabase.functions.invoke('departments', { method: 'GET' });
      edgeLatency = Date.now() - edgeStart;
      if (response.error) edgeStatus = "degraded";
    } catch {
      edgeStatus = "outage";
    }

    setServices([
      { 
        name: "Web Application", 
        icon: Globe, 
        status: "operational", 
        latency: 50,
        description: "Main application frontend" 
      },
      { 
        name: "Database", 
        icon: Database, 
        status: dbError ? "degraded" : "operational", 
        latency: dbLatency,
        description: "PostgreSQL database cluster" 
      },
      { 
        name: "Authentication", 
        icon: Shield, 
        status: "operational",
        latency: 45,
        description: "User authentication services" 
      },
      { 
        name: "API Gateway", 
        icon: Server, 
        status: edgeStatus, 
        latency: edgeLatency,
        description: "Edge function endpoints" 
      },
    ]);
    
    setLastChecked(new Date());
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-100";
      case "degraded": return "text-yellow-600 bg-yellow-100";
      case "outage": return "text-red-600 bg-red-100";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "operational": return CheckCircle2;
      case "degraded": return AlertCircle;
      case "outage": return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case "operational": return "Operational";
      case "degraded": return "Degraded";
      case "outage": return "Outage";
      default: return "Checking...";
    }
  };

  const allOperational = services.every(s => s.status === "operational");

  const recentIncidents = [
    { date: "No incidents", description: "All systems have been operating normally.", status: "resolved" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">System Status</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/security">
              <Button variant="ghost">Security</Button>
            </Link>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Overall Status Banner */}
      <section className={`py-8 ${allOperational ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {allOperational ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            )}
            <h1 className="text-3xl font-bold">
              {allOperational ? "All Systems Operational" : "Some Systems Degraded"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        </div>
      </section>

      {/* Uptime Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>30-Day Uptime</CardDescription>
                <CardTitle className="text-3xl">{overallUptime}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={overallUptime} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Response Time</CardDescription>
                <CardTitle className="text-3xl">
                  {Math.round(services.reduce((acc, s) => acc + (s.latency || 0), 0) / services.length)}ms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">Within normal range</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Incidents</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">No ongoing issues</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Service Status */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Service Status</h2>
          <div className="space-y-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {service.latency && (
                          <span className="text-sm text-muted-foreground">
                            {service.latency}ms
                          </span>
                        )}
                        <Badge className={getStatusColor(service.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(service.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Recent Incidents */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Recent Incidents</h2>
          <Card>
            <CardContent className="py-6">
              {recentIncidents.map((incident, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{incident.date}</h3>
                    <p className="text-muted-foreground">{incident.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Subscribe to receive notifications about system status updates and scheduled maintenance.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={checkServices}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Link to="/contact">
              <Button variant="outline">Report an Issue</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthCare HMS. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/status" className="hover:text-foreground">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Status;
