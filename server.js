const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51QnOvRRxVP7yohx45jZ9ukirkV3Nzb4PHtpDtccfgOeQUG7T9LW1iqBegCCeEC7sHlxztljJV1hFgRquH0sQAJvT00QuyxYPlT');

const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());

// Rota para criar sessão de checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { priceId } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancelado.html`,
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para verificar status da sessão
app.get('/check-session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json({ paid: session.payment_status === 'paid' });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 