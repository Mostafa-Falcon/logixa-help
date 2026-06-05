-- Logixa Help Database Schema
-- Run this in Supabase SQL Editor

-- Users / Profiles (syncs with Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'trusted', 'moderator', 'admin')),
  reputation INTEGER DEFAULT 0,
  threads_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '💬',
  sort_order INTEGER DEFAULT 0,
  threads_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Threads
CREATE TABLE threads (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  views INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  best_answer_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published threads are viewable by everyone"
  ON threads FOR SELECT USING (status = 'published');

CREATE POLICY "Moderators can view all threads"
  ON threads FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

CREATE POLICY "Authenticated users can create threads"
  ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own threads"
  ON threads FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Moderators can update any thread"
  ON threads FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Replies
CREATE TABLE replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible replies are viewable by everyone"
  ON replies FOR SELECT USING (status = 'visible');

CREATE POLICY "Moderators can view all replies"
  ON replies FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

CREATE POLICY "Authenticated users can create replies"
  ON replies FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies"
  ON replies FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Moderators can update any reply"
  ON replies FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  threads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT USING (true);

-- Thread-Tag junction
CREATE TABLE thread_tags (
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, tag_id)
);

ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thread tags are viewable by everyone"
  ON thread_tags FOR SELECT USING (true);

-- Votes
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'reply')),
  target_id INTEGER NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
  ON votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE USING (auth.uid() = user_id);

-- Reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'reply')),
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view and manage reports"
  ON reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

CREATE POLICY "Moderators can update reports"
  ON reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- Bookmarks
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, thread_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'vote', 'best_answer', 'report_update', 'mod_action')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- User sessions (online presence)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are viewable by everyone"
  ON user_sessions FOR SELECT USING (true);

CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session"
  ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Increment thread views function (used by the API)
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET views = views + 1 WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vote functions
CREATE OR REPLACE FUNCTION increment_thread_votes(thread_id INTEGER, vote_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET votes_count = votes_count + vote_value WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_thread_votes(thread_id INTEGER, vote_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET votes_count = GREATEST(votes_count - vote_value, 0) WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION change_thread_votes(thread_id INTEGER, old_value SMALLINT, new_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET votes_count = votes_count - old_value + new_value WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_reply_votes(reply_id INTEGER, vote_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE replies SET votes_count = votes_count + vote_value WHERE id = reply_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_reply_votes(reply_id INTEGER, vote_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE replies SET votes_count = GREATEST(votes_count - vote_value, 0) WHERE id = reply_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION change_reply_votes(reply_id INTEGER, old_value SMALLINT, new_value SMALLINT)
RETURNS VOID AS $$
BEGIN
  UPDATE replies SET votes_count = votes_count - old_value + new_value WHERE id = reply_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Functions & Triggers

-- Update threads_count on categories
CREATE OR REPLACE FUNCTION update_category_threads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET threads_count = threads_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET threads_count = GREATEST(threads_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_thread_inserted
  AFTER INSERT ON threads FOR EACH ROW
  EXECUTE FUNCTION update_category_threads_count();

CREATE TRIGGER on_thread_deleted
  AFTER DELETE ON threads FOR EACH ROW
  EXECUTE FUNCTION update_category_threads_count();

-- Update replies_count on threads
CREATE OR REPLACE FUNCTION update_thread_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE threads SET replies_count = replies_count + 1 WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE threads SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_inserted
  AFTER INSERT ON replies FOR EACH ROW
  EXECUTE FUNCTION update_thread_replies_count();

CREATE TRIGGER on_reply_deleted
  AFTER DELETE ON replies FOR EACH ROW
  EXECUTE FUNCTION update_thread_replies_count();

-- Update replies_count and threads_count on profiles
CREATE OR REPLACE FUNCTION update_profile_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'threads' THEN
      UPDATE profiles SET threads_count = threads_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_TABLE_NAME = 'replies' THEN
      UPDATE profiles SET replies_count = replies_count + 1 WHERE id = NEW.author_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'threads' THEN
      UPDATE profiles SET threads_count = GREATEST(threads_count - 1, 0) WHERE id = OLD.author_id;
    ELSIF TG_TABLE_NAME = 'replies' THEN
      UPDATE profiles SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.author_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_thread_profile
  AFTER INSERT OR DELETE ON threads FOR EACH ROW
  EXECUTE FUNCTION update_profile_counts();

CREATE TRIGGER on_reply_profile
  AFTER INSERT OR DELETE ON replies FOR EACH ROW
  EXECUTE FUNCTION update_profile_counts();

-- Update last_activity_at on categories
CREATE OR REPLACE FUNCTION update_category_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories SET last_activity_at = NOW() WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_thread_activity
  AFTER INSERT ON threads FOR EACH ROW
  EXECUTE FUNCTION update_category_last_activity();

CREATE TRIGGER on_reply_activity
  AFTER INSERT ON replies FOR EACH ROW
  EXECUTE FUNCTION update_category_last_activity();

-- Seed categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('مشاكل الكمبيوتر والويندوز', 'windows', 'حلول لمشاكل ويندوز 10 و 11، أعطال الكمبيوتر، تحسين الأداء', '💻', 1),
  ('مشاكل الموبايل والتطبيقات', 'mobile', 'حلول لمشاكل الأندرويد و iOS، أعطال التطبيقات', '📱', 2),
  ('البرمجة وتطوير المواقع', 'programming', 'أسئلة وأجوبة في HTML، CSS، JavaScript، Python ولغات البرمجة', '💻', 3),
  ('الذكاء الاصطناعي والأدوات', 'ai-tools', 'شروحات وأدوات AI، ChatGPT، Midjourney، والبرامج الذكية', '🤖', 4),
  ('المشاريع الصغيرة والتسويق', 'business', 'نصائح للمشاريع الصغيرة، التسويق الإلكتروني، الربح من الإنترنت', '📊', 5),
  ('أسئلة عامة واستفسارات', 'general', 'أسئلة تقنية عامة واستفسارات متنوعة', '❓', 6),
  ('التعليم والدراسة', 'education', 'أسئلة عن التعلم، المذاكرة، الكورسات، الشهادات، وتطوير المهارات', '🎓', 7),
  ('الوظائف والعمل الحر', 'jobs-freelance', 'نصائح للبحث عن وظيفة، العمل الحر، كتابة CV، والمقابلات', '💼', 8),
  ('الألعاب والأجهزة', 'gaming-devices', 'مشاكل الألعاب، الأجهزة، الإعدادات، الأداء، وتجميعات الكمبيوتر', '🎮', 9),
  ('الأمن الرقمي والحسابات', 'digital-security', 'حماية الحسابات، كلمات المرور، الاختراق، والخصوصية الرقمية', '🛡️', 10),
  ('البرامج والأدوات', 'software-tools', 'ترشيحات وحلول لمشاكل البرامج، الإنتاجية، وأدوات العمل اليومية', '🧰', 11),
  ('المال والربح من الإنترنت', 'online-income', 'أسئلة عن مصادر الدخل، المواقع، الإعلانات، والتسويق بالعمولة', '💰', 12);
