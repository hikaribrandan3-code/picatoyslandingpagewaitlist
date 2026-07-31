const SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbz0CjncWAkvfc2G-e12_k5v2pfIq3OEgTYb_3wgGtUiIs22U93h58aHDPjl15xpLRjJ7Q/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, colorPreference } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await fetch(SHEET_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        colorPreference: colorPreference || 'not selected',
      }),
    });

    if (!response.ok) {
      console.error('Sheet webhook failed:', response.status);
      return res.status(400).json({ error: 'Failed to save to sheet' });
    }

    console.log(`Waitlist signup: ${email} (${colorPreference})`);
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('API error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
