import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebctuzdmutxjjlbovxtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViY3R1emRtdXR4ampsYm92eHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjc3NTksImV4cCI6MjEwMDk0Mzc1OX0.r6clnFBLwnu9MQZquLGpM7xqCBh6nO6VBX_KqLTEGzU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { email, colorPreference } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email, color_preference: colorPreference }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`Waitlist signup saved: ${email} (${colorPreference})`);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
