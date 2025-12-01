import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent p-1">
              <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
                <Download className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">Instale o Acolher</CardTitle>
              <CardDescription className="text-lg mt-2">
                Tenha acesso rápido e fácil no seu celular ou computador
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">App já instalado!</h3>
                  <p className="text-muted-foreground mt-2">
                    O Acolher já está instalado no seu dispositivo
                  </p>
                </div>
                <Button onClick={() => navigate("/app")} size="lg" className="w-full">
                  Abrir o App
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border">
                    <CardHeader>
                      <Smartphone className="w-8 h-8 text-primary mb-2" />
                      <CardTitle className="text-lg">No Celular</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p><strong>iPhone/Safari:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Toque no ícone de compartilhar</li>
                        <li>Role e toque em "Adicionar à Tela Início"</li>
                        <li>Toque em "Adicionar"</li>
                      </ol>
                      <p className="mt-3"><strong>Android/Chrome:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Toque no menu (3 pontos)</li>
                        <li>Toque em "Instalar app"</li>
                        <li>Toque em "Instalar"</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <Monitor className="w-8 h-8 text-accent mb-2" />
                      <CardTitle className="text-lg">No Computador</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Chrome/Edge:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Clique no ícone de instalação na barra de endereços</li>
                        <li>Ou clique no menu e selecione "Instalar Acolher"</li>
                        <li>Clique em "Instalar"</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>

                {isInstallable && (
                  <Button
                    onClick={handleInstall}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Instalar Agora
                  </Button>
                )}

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/app")}
                  >
                    Continuar sem instalar
                  </Button>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Benefícios de instalar:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Acesso rápido direto da tela inicial</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Funciona offline para suas rotinas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Notificações de lembretes e mensagens</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Experiência completa como um app nativo</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
