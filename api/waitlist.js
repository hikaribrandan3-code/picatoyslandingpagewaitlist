const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'hikaristudioai@gmail.com';

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
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    console.log(`Sending email to ${NOTIFY_EMAIL} for ${email}`);

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pica Yoyo <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: `New Pica Yoyo Waitlist Signup: ${email}`,
        html: `
          <h2>New Waitlist Signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Color Preference:</strong> ${colorPreference || 'Not selected'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errorData = await emailRes.json();
      console.error('Resend error:', errorData);
      throw new Error(`Resend error: ${JSON.stringify(errorData)}`);
    }

    console.log(`Waitlist signup: ${email} (${colorPreference})`);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
