import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [events] = useState([
    {
      id: 1,
      title: "Fútbol 5 - Cancha Norte",
      sport: "Fútbol",
      date: "2024-01-15",
      time: "18:00",
      location: "Complejo Deportivo Norte",
      participants: 8,
      maxParticipants: 10,
      probability: 85,
      organizer: "Juan Pérez"
    },
    {
      id: 2,
      title: "Baloncesto Universitario",
      sport: "Baloncesto",
      date: "2024-01-16",
      time: "16:00",
      location: "Gimnasio Universidad",
      participants: 6,
      maxParticipants: 8,
      probability: 70,
      organizer: "María García"
    },
    {
      id: 3,
      title: "Tenis Dobles",
      sport: "Tenis",
      date: "2024-01-17",
      time: "09:00",
      location: "Club de Tenis Central",
      participants: 3,
      maxParticipants: 4,
      probability: 95,
      organizer: "Carlos López"
    }
  ]);

  const getSportColor = (sport: string) => {
    const colors: { [key: string]: string } = {
      "Fútbol": "bg-primary text-primary-foreground",
      "Baloncesto": "bg-orange-500 text-white",
      "Tenis": "bg-blue-500 text-white"
    };
    return colors[sport] || "bg-secondary text-secondary-foreground";
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Únete a eventos deportivos en tu ciudad
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Encuentra compañeros para practicar tu deporte favorito o crea tu propio evento
        </p>
        <Link to="/create-event">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Crear Evento
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">142</CardTitle>
            <CardDescription>Eventos activos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">1,284</CardTitle>
            <CardDescription>Usuarios registrados</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">89%</CardTitle>
            <CardDescription>Tasa de éxito</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Próximos Eventos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className={getSportColor(event.sport)}>
                    {event.sport}
                  </Badge>
                </div>
                <CardDescription>Organizado por {event.organizer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {event.date} - {event.time}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  {event.participants}/{event.maxParticipants} participantes
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getProbabilityColor(event.probability)}`}>
                    {event.probability}% probabilidad
                  </span>
                  <Button size="sm">Unirse</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;