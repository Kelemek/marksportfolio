-- Supabase Schema for Mark's Portfolio
-- Run this in your Supabase SQL Editor

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  site_url TEXT,
  github_url TEXT,
  image_url TEXT,
  image_alt TEXT,
  type TEXT NOT NULL CHECK (type IN ('coding', 'drawing')),
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_visible ON projects(is_visible);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read visible projects (public portfolio)
CREATE POLICY "Anyone can view visible projects"
  ON projects
  FOR SELECT
  USING (is_visible = true);

-- Policy: Authenticated admin can do everything
-- Replace 'markdlarson@me.com' with your admin email
CREATE POLICY "Admin can do everything"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.email() = 'markdlarson@me.com')
  WITH CHECK (auth.email() = 'markdlarson@me.com');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view images
CREATE POLICY "Anyone can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Storage policy: Admin can upload/delete images
CREATE POLICY "Admin can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' 
    AND auth.email() = 'markdlarson@me.com'
  );

CREATE POLICY "Admin can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND auth.email() = 'markdlarson@me.com'
  );

CREATE POLICY "Admin can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND auth.email() = 'markdlarson@me.com'
  );

-- Seed data from existing projects.js
-- Coding Projects
INSERT INTO projects (slug, title, description, technologies, site_url, github_url, image_url, image_alt, type, display_order) VALUES
('gospel-presentation', 'Gospel Presentation', 'This is a site that I created to help in my biblical counceling at our church. It also has an admin site that alows creation of custom profiles that allow the user to fully customize all the text and scripture references.', ARRAY['Next.JS', 'Supabase', 'Supabase Auth', 'Magic Link', 'Typescript', 'Tailwind CSS', 'ESV API'], 'https://gospel-presentation.vercel.app/', 'https://github.com/Kelemek/gospel_presentation', NULL, 'Gospel Presentation site', 'coding', 1),
('prayer-app', 'Prayer Manager', 'This is a site that I am currently working on to manage our prayer chain at our church.', ARRAY['React', 'React Routing', 'Supabase', 'Supabase Auth', 'Magic Link', 'Typescript', 'Tailwind CSS', 'Microsoft Graph API for Email', 'Planning Center API', 'Email 2FA'], 'https://cp-church-prayer.vercel.app/', 'https://github.com/Kelemek/prayerapp', NULL, 'Prayer app using react and supabase', 'coding', 2),
('travel-api', 'My Travel API', 'This is a travel API written for Node.js but modified to run in Netlify.', ARRAY['Node.js', 'Javascript'], 'https://mytravelapi.netlify.app/', 'https://github.com/Kelemek/travelapi', NULL, 'Travel API built for Node.js', 'coding', 3),
('typed-coding-endgame', 'Coding Endgame', 'This is a hangman style game written in React and then refactored in TypeScript', ARRAY['HTML', 'CSS', 'React', 'Typescript'], 'https://typedendgame.netlify.app', 'https://github.com/Kelemek/Typescript_Endgame', NULL, 'Game of hangman built in React and typescript', 'coding', 4),
('tenzies-game', 'Game of Tenzies', 'This was a fun project to build in React and then refactored in Typescript', ARRAY['HTML', 'CSS', 'React', 'Typescript'], 'https://my-tenzies-dicegame.netlify.app/', 'https://github.com/Kelemek/react-tenzies', NULL, 'Game of Tenzies built in React', 'coding', 5),
('digital-business-card', 'Digital Business Card', 'My first React solo project.', ARRAY['HTML', 'CSS', 'React'], 'https://marksdigitalbusinesscard.netlify.app/', 'https://github.com/Kelemek/digital-business-card', NULL, 'Marks digital business card built in React', 'coding', 6),
('movie-watchlist', 'Movie Watchlist', 'Search for the next movie you would like to see or create a list of your favorites. This app fetches data from OpenIMDB and lets you save your favorites to local storage.', ARRAY['HTML', 'CSS', 'JavaScript', 'RESTful API'], 'https://mymoviefavorites.netlify.app/', 'https://github.com/Kelemek/moviewatchlist', NULL, 'Search and save your favorite movies to a watchlist.', 'coding', 7),
('color-scheme-generator', 'Color Scheme Generator', 'Helpful tool to generate color schemes for your next coding project. Pick a base color and genterate a color scheme from it pulled from the Color API. You can also click on the colors and the hex code will be copied to your clipboard.', ARRAY['HTML', 'CSS', 'JavaScript', 'RESTful API'], 'https://makecolorscheme.netlify.app/', 'https://github.com/Kelemek/colorschemegenerator', NULL, 'Tool to generate color schemes based on a base color.', 'coding', 8),
('password-generator', 'Password Generator', 'Handy app that generates two secure random passwords. When you click a generated password it copies it to your clipboard.', ARRAY['HTML', 'CSS', 'JavaScript'], 'https://mypasswordgeneratorsite.netlify.app/', 'https://github.com/Kelemek/passwordgenerator', NULL, 'Password generator site with and without generated passwords.', 'coding', 9),
('hometown-parks', 'Hometown Parks', 'Site that shows my favorite parks in my hometown of Cambridge, Minnesota.', ARRAY['HTML', 'CSS'], 'https://hometownparks.netlify.app/', 'https://github.com/Kelemek/HometownSite', NULL, 'Hometown parks website showing three favorite parks.', 'coding', 10);

-- Drawing Projects
INSERT INTO projects (slug, title, description, technologies, site_url, github_url, image_url, image_alt, type, display_order) VALUES
('mom-portrait', 'Mom', 'A portrait of my Mom drawn on my iPad using Procreate.', ARRAY['Procreate'], NULL, NULL, NULL, 'A portrait of my Mom drawn on my iPad using the Procreate.', 'drawing', 1),
('butterfly-drawing', 'Butterfly', 'A drawing of a photo my son took.', ARRAY['Procreate'], NULL, NULL, NULL, 'A drawing of a butterfly photo my son took.', 'drawing', 2),
('gracie-portrait', 'Gracie', 'A portrait of my daughter''s cat that I drew on my iPad.', ARRAY['Procreate'], NULL, NULL, NULL, 'A drawing of a picture my son took that I drew on my iPad using the Procreate.', 'drawing', 3),
('grace-portrait', 'Grace', 'A portrait of my daughter''s cat saying "Dont look at me!".', ARRAY['Procreate'], NULL, NULL, NULL, 'A portrait of my daughter''s cat that I drew on my iPad.', 'drawing', 4);

-- Note: After running this script, upload images to Supabase Storage 
-- and update the image_url field for each project
