const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        // Lidar com requisições OPTIONS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Verificar método
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Método não permitido' });
            return;
        }

        // Verificar body
        if (!req.body || typeof req.body !== 'object') {
            res.status(400).json({ error: 'Body inválido' });
            return;
        }

        const { priceId } = req.body;

        // Validar priceId
        if (!priceId) {
            res.status(400).json({ error: 'priceId é obrigatório' });
            return;
        }

        // Criar sessão do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.headers.origin || process.env.VERCEL_URL}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || process.env.VERCEL_URL}/cancelado.html`,
        });

        // Retornar ID da sessão
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Erro no checkout:', error);
        res.status(500).json({ 
            error: 'Erro ao processar checkout',
            message: error.message
        });
    }
}; 