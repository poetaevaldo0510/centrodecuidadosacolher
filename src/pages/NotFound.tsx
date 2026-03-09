import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Heart, Home } from "lucide-react";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Página não encontrada - Acolher";
    return () => { document.title = "Acolher - Cuidando de Quem Cuida"; };
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <Logo variant="icon" size="xl" className="mx-auto mb-6" />
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">Página não encontrada</p>
        <p className="mb-8 text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition shadow-lg"
        >
          <Home size={18} />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
