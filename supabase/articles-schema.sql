-- Create articles table for persistent storage
-- This will replace the read-only articles.js file

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  excerpt TEXT,
  category TEXT DEFAULT 'general',
  category_label TEXT DEFAULT 'Général',
  keywords JSONB DEFAULT '[]'::jsonb,
  author TEXT DEFAULT 'CCI Services',
  author_image TEXT DEFAULT '/logo.png',
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image TEXT DEFAULT '/default-article.jpg',
  image_alt TEXT,
  read_time TEXT DEFAULT '5 min',
  featured BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = true;

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for website)
CREATE POLICY "Allow public read access to articles" ON articles
  FOR SELECT USING (true);

-- Allow API to insert/update articles (service role)
CREATE POLICY "Allow service role full access to articles" ON articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to automatically update updated_date
CREATE OR REPLACE FUNCTION update_articles_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_date
DROP TRIGGER IF EXISTS trigger_update_articles_updated_date ON articles;
CREATE TRIGGER trigger_update_articles_updated_date
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_date();

-- Comments for documentation
COMMENT ON TABLE articles IS 'Stores all blog articles for the CCI Services website';
COMMENT ON COLUMN articles.slug IS 'URL-friendly unique identifier for the article';
COMMENT ON COLUMN articles.keywords IS 'JSON array of SEO keywords for the article';
COMMENT ON COLUMN articles.content IS 'Full article content in markdown or HTML format';