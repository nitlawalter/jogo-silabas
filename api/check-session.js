const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const sessionId = req.query.sessionId;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json({ paid: session.payment_status === 'paid' });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
}; 