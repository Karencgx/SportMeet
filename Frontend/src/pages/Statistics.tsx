import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Calendar, Target } from "lucide-react";

const Statistics = () => {
  const stats = {
    totalEvents: 45,
    successRate: 87,
    averageParticipants: 8.2,
    popularSports: [
      { name: "Fútbol", events: 18, rate: 92 },
      { name: "Baloncesto", events: 12, rate: 85 },
      { name: "Tenis", events: 8, rate: 78 },
      { name: "Voleibol", events: 7, rate: 89 }
    ],
    monthlyTrends: [
      { month: "Enero", events: 15, success: 90 },
      { month: "Febrero", events: 12, success: 85 },
      { month: "Marzo", events: 18, success: 88 }
    ]
  };

  const probabilityFactors = [
    {
      factor: "Horario del evento",
      impact: "Alto",
      description: "Eventos entre 18:00-20:00 tienen 30% más participación"
    },
    {
      factor: "Ubicación",
      impact: "Medio",
      description: "Ubicaciones centrales aumentan participación en 15%"
    },
    {
      factor: "Día de la semana",
      impact: "Medio", 
      description: "Fines de semana tienen 20% más participación"
    },
    {
      factor: "Anticipación",
      impact: "Bajo",
      description: "Eventos creados con 3+ días de anticipación son más exitosos"
    }
  ];

  const getImpactColor = (impact: string) => {
    const colors: { [key: string]: string } = {
      "Alto": "bg-red-100 text-red-800",
      "Medio": "bg-yellow-100 text-yellow-800",
      "Bajo": "bg-green-100 text-green-800"
    };
    return colors[impact] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Estadísticas</h1>
        <p className="text-muted-foreground">
          Análisis de probabilidades y tendencias de eventos deportivos
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageParticipants}</div>
            <p className="text-xs text-muted-foreground">
              +0.8 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+15%</div>
            <p className="text-xs text-muted-foreground">
              Crecimiento mensual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sports Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Deportes Más Populares</CardTitle>
            <CardDescription>
              Análisis de eventos por deporte y tasa de éxito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.popularSports.map((sport, index) => (
              <div key={sport.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{sport.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {sport.events} eventos
                    </span>
                    <Badge variant="secondary">{sport.rate}%</Badge>
                  </div>
                </div>
                <Progress value={sport.rate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
            <CardDescription>
              Evolución de eventos y tasa de éxito por mes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.monthlyTrends.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {month.events} eventos
                    </span>
                    <Badge variant="secondary">{month.success}%</Badge>
                  </div>
                </div>
                <Progress value={month.success} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Probability Factors */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Factores de Probabilidad</CardTitle>
          <CardDescription>
            Elementos que influyen en el éxito de los eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {probabilityFactors.map((factor, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{factor.factor}</h4>
                  <Badge className={getImpactColor(factor.impact)}>
                    {factor.impact}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;