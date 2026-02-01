import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, Maximize2, Minimize2, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ModalBase from './ModalBase';
import { Button } from '@/components/ui/button';

interface VideoCallModalProps {
  roomName?: string;
  displayName?: string;
  onClose?: () => void;
}

const VideoCallModal = ({ roomName, displayName = 'Usuário', onClose }: VideoCallModalProps) => {
  const { setActiveModal } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  // Generate a unique room name if not provided
  const finalRoomName = roomName || `acolher-sos-${Date.now()}`;

  useEffect(() => {
    // Load Jitsi Meet API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (jitsiContainerRef.current && (window as any).JitsiMeetExternalAPI) {
          apiRef.current = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
            roomName: finalRoomName,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            userInfo: {
              displayName: displayName,
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableDeepLinking: true,
              prejoinPageEnabled: false,
              enableWelcomePage: false,
              enableClosePage: false,
              disableInviteFunctions: true,
              toolbarButtons: [
                'microphone',
                'camera',
                'closedcaptions',
                'fullscreen',
                'chat',
                'hangup',
                'settings',
                'videoquality',
                'tileview',
              ],
              defaultLanguage: 'pt-BR',
              disableModeratorIndicator: true,
              disableThirdPartyRequests: true,
              enableNoisyMicDetection: true,
              enableNoAudioDetection: true,
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              DEFAULT_BACKGROUND: '#1a1a2e',
              DEFAULT_REMOTE_DISPLAY_NAME: 'Profissional',
              TOOLBAR_ALWAYS_VISIBLE: true,
              MOBILE_APP_PROMO: false,
              HIDE_DEEP_LINKING_LOGO: true,
              HIDE_INVITE_MORE_HEADER: true,
              DISABLE_VIDEO_BACKGROUND: false,
              GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
              DISPLAY_WELCOME_FOOTER: false,
              DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
              DISPLAY_WELCOME_PAGE_CONTENT: false,
              DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            },
          });

          // Event listeners
          apiRef.current.addEventListener('videoConferenceJoined', () => {
            setIsConnecting(false);
          });

          apiRef.current.addEventListener('readyToClose', () => {
            handleClose();
          });
        }
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        setIsConnecting(false);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [finalRoomName, displayName]);

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
    }
    if (onClose) {
      onClose();
    } else {
      setActiveModal(null);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const shareRoomLink = () => {
    const link = `https://meet.jit.si/${finalRoomName}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <ModalBase variant="fullscreen" title="" showCloseButton={false}>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Video className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-foreground">SOS Acolher - Videochamada</h2>
              <p className="text-xs text-muted-foreground">
                {isConnecting ? 'Conectando...' : 'Conectado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClose}
              className="gap-1"
            >
              <PhoneOff size={16} />
              Encerrar
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative">
          {isConnecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Video size={40} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Iniciando videochamada...</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Aguarde enquanto preparamos sua sala de atendimento terapêutico
              </p>
            </div>
          )}
          <div
            ref={jitsiContainerRef}
            className={`w-full h-full ${isConnecting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          />
        </div>

        {/* Footer info */}
        <div className="p-3 bg-card border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Esta chamada é criptografada e privada. Seu acolhimento é nossa prioridade.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default VideoCallModal;
