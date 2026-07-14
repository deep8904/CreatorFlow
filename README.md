# CreatorFlow

## Supabase setup

1. Create a Supabase project.
2. Copy .env.example to .env.local and fill in your project URL and anon key.
3. Apply the SQL in supabase/schema.sql from the Supabase SQL Editor.
4. Enable Email/Password and Google auth providers in Supabase Auth.
5. Set the redirect URL for auth callbacks to http://localhost:3000/auth/callback.

The frontend UI remains untouched while the backend foundation is prepared for the upcoming app integration work.
