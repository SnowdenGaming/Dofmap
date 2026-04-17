const express = require('express');
const session = require('express-session');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuggwavwouuxqjqawqoc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_8KCgGX0rOhhKxml20udL6A_dNYWP3Zq';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

function userSupabase(req) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${req.session.accessToken}` }
    }
  });
}

function toApiMap(row, userId = null) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    name: row.name,
    cells: row.cells || {},
    isPublic: !!row.is_public,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    readonly: userId ? row.user_id !== userId : true
  };
}

function mapSummary(row) {
  const map = toApiMap(row);
  const { cells, readonly, ...meta } = map;
  return { ...meta, annotationCount: Object.keys(cells || {}).length };
}

function saveSession(req, authData) {
  const user = authData.user;
  const sessionData = authData.session;
  req.session.userId = user.id;
  req.session.username = user.user_metadata?.username || user.email?.split('@')[0] || 'Aventurier';
  req.session.email = user.email;
  req.session.accessToken = sessionData?.access_token;
  req.session.refreshToken = sessionData?.refresh_token;
}

function authErrorMessage(error) {
  const message = error?.message || 'Erreur Supabase Auth.';
  const lower = message.toLowerCase();

  if (lower.includes('email rate limit')) {
    return 'Trop de mails envoyés par Supabase. Attendez quelques minutes ou désactivez la confirmation e-mail pendant les tests.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Votre e-mail doit être confirmé avant la connexion.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Un compte existe déjà avec cette adresse e-mail.';
  }
  return message;
}

function requireAuth(req, res, next) {
  if (!req.session.userId || !req.session.accessToken) {
    return res.status(401).json({ error: 'Non connecté.' });
  }
  next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dofusretro-supabase-session',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || username.trim().length < 3)
    return res.status(400).json({ error: 'Le pseudo doit faire au moins 3 caractères.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''))
    return res.status(400).json({ error: 'Adresse e-mail invalide.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { username: username.trim() } }
  });

  if (error) return res.status(400).json({ error: authErrorMessage(error) });
  if (!data.session) {
    return res.json({
      ok: true,
      needsEmailConfirmation: true,
      message: 'Compte créé. Vérifiez votre e-mail avant de vous connecter.'
    });
  }

  saveSession(req, data);
  res.json({ ok: true, username: req.session.username });
});

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password)
    return res.status(400).json({ error: 'Champs manquants.' });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim().toLowerCase(),
    password
  });

  if (error) return res.status(401).json({ error: authErrorMessage(error) });
  saveSession(req, data);
  res.json({ ok: true, username: req.session.username });
});

app.post('/api/logout', async (req, res) => {
  if (req.session.accessToken) await userSupabase(req).auth.signOut();
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({
    user: {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email
    }
  });
});

app.get('/api/maps', requireAuth, async (req, res) => {
  const { data, error } = await userSupabase(req)
    .from('maps')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapSummary));
});

app.get('/api/maps/public', async (req, res) => {
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapSummary));
});

app.post('/api/maps', requireAuth, async (req, res) => {
  const { name, isPublic } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nom requis.' });

  const now = new Date().toISOString();
  const { data, error } = await userSupabase(req)
    .from('maps')
    .insert({
      user_id: req.session.userId,
      username: req.session.username,
      name: name.trim(),
      cells: {},
      is_public: !!isPublic,
      created_at: now,
      updated_at: now
    })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(toApiMap(data, req.session.userId));
});

app.get('/api/maps/:id', async (req, res) => {
  const client = req.session.accessToken ? userSupabase(req) : supabase;
  const { data, error } = await client
    .from('maps')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(error.code === 'PGRST116' ? 404 : 403).json({ error: 'Map introuvable.' });
  res.json(toApiMap(data, req.session.userId || null));
});

app.put('/api/maps/:id', requireAuth, async (req, res) => {
  const { name, cells, isPublic } = req.body || {};
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = (name.trim() || 'Sans titre');
  if (cells !== undefined) patch.cells = cells;
  if (isPublic !== undefined) patch.is_public = !!isPublic;

  const { error } = await userSupabase(req)
    .from('maps')
    .update(patch)
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/maps/:id', requireAuth, async (req, res) => {
  const { error } = await userSupabase(req)
    .from('maps')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n  ⚔  Dofus Rétro — Serveur démarré`);
  console.log(`  →  http://localhost:${PORT}`);
  console.log(`  →  Supabase: ${SUPABASE_URL}\n`);
});
