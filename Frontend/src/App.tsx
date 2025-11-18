import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Usuarios from "./pages/Usuarios";
import Eventos from "./pages/Eventos";
import Amigos from "./pages/Amigos";
import Deportes from "./pages/Deportes";
import Instalaciones from "./pages/Instalaciones";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
       <Routes>
    {/* 1. RUTAS PÚBLICAS SIN LAYOUT (Login es la ruta principal) */}
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} /> 
    <Route path="/register" element={<Register />} />

    {/* 2. RUTAS PROTEGIDAS CON LAYOUT */}
    <Route element={<Layout />}>
        
        {/* Rutas internas, ahora relativas al path padre (que no tiene path, pero es el Layout) */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="amigos" element={<Amigos />} />
        <Route path="deportes" element={<Deportes />} />
        <Route path="instalaciones" element={<Instalaciones />} />
        <Route path= "perfil" element ={ <Perfil />} />

    </Route>

    {/* 3. Ruta de error (404) */}
    <Route path="*" element={<NotFound />} />
</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
