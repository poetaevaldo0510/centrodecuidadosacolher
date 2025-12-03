-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Activity logs table for tracking all platform activities
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);

-- User levels and achievements
CREATE TABLE public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  level TEXT NOT NULL DEFAULT 'bronze',
  total_points INTEGER DEFAULT 0,
  level_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own level"
ON public.user_levels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own level"
ON public.user_levels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all levels"
ON public.user_levels FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Badges/Achievements table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  level TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User badges (earned achievements)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user badges"
ON public.user_badges FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Social feed for anonymous sharing
CREATE TABLE public.social_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anonymous_name TEXT NOT NULL,
  content TEXT NOT NULL,
  achievement_type TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.social_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view feed posts"
ON public.social_feed FOR SELECT
USING (true);

CREATE POLICY "Users can create posts"
ON public.social_feed FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.social_feed FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.social_feed FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
ON public.social_feed FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_social_feed_created_at ON public.social_feed(created_at DESC);

-- Likes for social feed
CREATE TABLE public.feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
ON public.feed_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.feed_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.feed_likes FOR DELETE
USING (auth.uid() = user_id);

-- Weekly challenges
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active challenges"
ON public.weekly_challenges FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
ON public.weekly_challenges FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User challenge progress
CREATE TABLE public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.weekly_challenges(id) ON DELETE CASCADE NOT NULL,
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON public.user_challenge_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_challenge_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.user_challenge_progress FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, level, points_required) VALUES
('Iniciante', 'Completou o primeiro dia no app', '🌱', 'bronze', 10),
('Persistente', 'Manteve streak de 7 dias', '🔥', 'bronze', 100),
('Dedicado', 'Manteve streak de 30 dias', '💪', 'silver', 500),
('Guardião', 'Manteve streak de 90 dias', '🛡️', 'gold', 1500),
('Explorador', 'Explorou todas as funcionalidades', '🗺️', 'silver', 300),
('Comunicador', 'Participou ativamente na comunidade', '💬', 'silver', 400),
('Mestre', 'Atingiu 5000 pontos', '👑', 'gold', 5000);

-- Insert initial weekly challenge
INSERT INTO public.weekly_challenges (title, description, challenge_type, target_count, bonus_points, start_date, end_date) VALUES
('Desafio Semanal: Rotina Completa', 'Complete todas as suas rotinas diárias por 5 dias esta semana', 'daily_routine', 5, 100, NOW(), NOW() + INTERVAL '7 days');

-- Function to update social feed counters
CREATE OR REPLACE FUNCTION update_feed_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_feed 
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_feed 
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_likes_counter
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION update_feed_likes_count();

-- Function to auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.user_levels (user_id, level, total_points)
  VALUES (NEW.id, 'bronze', 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();