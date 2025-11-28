import { useState, useEffect } from 'react';
import { Camera, Plus, ArrowLeftRight, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';

interface ProgressPhoto {
  id: string;
  child_name: string | null;
  photo_url: string;
  caption: string | null;
  milestone_type: string | null;
  date_taken: string;
  is_before: boolean;
  comparison_pair_id: string | null;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const setActiveModal = useAppStore(state => state.setActiveModal);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_taken', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as fotos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setActiveModal('uploadPhoto');
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    const milestone = photo.milestone_type || 'Outros';
    if (!acc[milestone]) {
      acc[milestone] = [];
    }
    acc[milestone].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Galeria de Progresso</h1>
            <p className="text-muted-foreground">Acompanhe o desenvolvimento do seu filho</p>
          </div>
          <Button onClick={handleUploadClick} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Foto
          </Button>
        </div>

        {photos.length === 0 ? (
          <Card className="p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma foto ainda</h3>
            <p className="text-muted-foreground mb-4">
              Comece a documentar o progresso do seu filho
            </p>
            <Button onClick={handleUploadClick}>
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Primeira Foto
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPhotos).map(([milestone, milestonePhotos]) => (
              <div key={milestone}>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-foreground">{milestone}</h2>
                  <Badge variant="secondary">{milestonePhotos.length}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {milestonePhotos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        <img
                          src={photo.photo_url}
                          alt={photo.caption || 'Progress photo'}
                          className="w-full h-full object-cover"
                        />
                        {photo.is_before && (
                          <Badge className="absolute top-2 left-2 bg-blue-500">
                            Antes
                          </Badge>
                        )}
                        {photo.comparison_pair_id && (
                          <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1">
                            <ArrowLeftRight className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-2">
                          {photo.caption || 'Sem legenda'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(photo.date_taken).toLocaleDateString('pt-BR')}
                        </p>
                        {photo.child_name && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {photo.child_name}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
