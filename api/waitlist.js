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
    const apiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!apiKey || !notifyEmail) {
      return res.status(500).json({
        error: 'Missing configuration',
        hasKey: !!apiKey,
        hasEmail: !!notifyEmail
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: notifyEmail,
        subject: `Pica Yoyo Waitlist: ${email}`,
        text: `New signup: ${email} (${colorPreference})`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend failed:', data);
      return res.status(400).json({ error: data.message || 'Email send failed' });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
