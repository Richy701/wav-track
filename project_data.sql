-- SQL script to insert dummy data into WavTrack Supabase database
-- Project 1: Late Night Vibes
INSERT INTO projects (id, title, description, status, bpm, key, genre, tags, user_id, created_at, last_modified, completionPercentage) VALUES
(gen_random_uuid(), 'Late Night Vibes', 'Downtempo beat with atmospheric pads and lo-fi drums', 'completed', 85, 'Dm', 'Lofi', ARRAY['chill', 'night', 'instrumental'], 'USER_ID', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days', 100),
(gen_random_uuid(), 'Summer Bounce', 'Upbeat tropical house track with vocal chops', 'mastering', 128, 'G', 'House', ARRAY['summer', 'dance', 'tropical'], 'USER_ID', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day', 75),
(gen_random_uuid(), 'Dystopian Drill', 'Dark UK drill with cinematic elements', 'mixing', 140, 'C#m', 'Drill', ARRAY['dark', 'uk', 'trap'], 'USER_ID', NOW() - INTERVAL '21 days', NOW() - INTERVAL '3 days', 50),
(gen_random_uuid(), 'Quantum Funk', 'Funky bassline with syncopated rhythm and retro synths', 'in-progress', 110, 'Eb', 'Funk', ARRAY['bass', 'retro', 'synth'], 'USER_ID', NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days', 25),
(gen_random_uuid(), 'Neon Dreams', 'Synthwave track with arpeggiated melodies', 'idea', 96, 'Bm', 'Synthwave', ARRAY['retro', '80s', 'synth'], 'USER_ID', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', 0),
(gen_random_uuid(), 'Urban Echo', 'Modern RnB with trap elements and vocal effects', 'in-progress', 92, 'F#m', 'RnB', ARRAY['urban', 'vocal', 'trap'], 'USER_ID', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', 25),
(gen_random_uuid(), 'Celestial', 'Ambient soundscape with evolving textures', 'mixing', 75, 'C', 'Ambient', ARRAY['space', 'chill', 'texture'], 'USER_ID', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', 50),
(gen_random_uuid(), 'Cyberpunk Riddim', 'Heavy dubstep with glitchy sound design', 'completed', 150, 'F', 'Dubstep', ARRAY['heavy', 'bass', 'glitch'], 'USER_ID', NOW() - INTERVAL '30 days', NOW() - INTERVAL '7 days', 100),
(gen_random_uuid(), 'Analog Nostalgia', 'Boom bap beat with vinyl samples and warm bass', 'mastering', 90, 'Ab', 'Hip Hop', ARRAY['boombap', 'vinyl', 'samples'], 'USER_ID', NOW() - INTERVAL '28 days', NOW() - INTERVAL '3 days', 75),
(gen_random_uuid(), 'Cloud Nine', 'Dreamy pop with vocal chops and airy synths', 'idea', 118, 'D', 'Pop', ARRAY['dreamy', 'vocals', 'synth'], 'USER_ID', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 0),
(gen_random_uuid(), 'Metro Pulse', 'Tech house with driving baseline and percussive elements', 'in-progress', 125, 'Am', 'Tech House', ARRAY['club', 'dance', 'percussion'], 'USER_ID', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 25),
(gen_random_uuid(), 'Jungle Therapy', 'Fast-paced breakbeat with atmospheric samples', 'mixing', 170, 'Gm', 'Jungle', ARRAY['breaks', 'fast', 'atmospheric'], 'USER_ID', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days', 50),
(gen_random_uuid(), 'Astral Projection', 'Psychedelic trance with hypnotic sequences', 'idea', 138, 'E', 'Psytrance', ARRAY['psychedelic', 'hypnotic', 'trance'], 'USER_ID', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 0),
