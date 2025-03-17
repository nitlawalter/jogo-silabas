// Configuração do Stripe
const stripe = Stripe('pk_test_51QnOvRRxVP7yohx400reSRiVM6Uz52b5eoElO7OS1CS46HvUY2hFRsqpUkJcSd5hTbifgz8pXq9PoW8fYzDFGbj500KUopywlQ');

// Função para iniciar o checkout
async function iniciarCheckout(priceId) {
    try {
        console.log('Iniciando checkout com priceId:', priceId);
        
        // Redirecionar diretamente para o Checkout
        const { error } = await stripe.redirectToCheckout({
            submitType: 'auto',
            mode: 'subscription',
            lineItems: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            successUrl: `${window.location.origin}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cancelado.html`
        });

        if (error) {
            console.error('Erro no checkout:', error);
            alert('Erro ao iniciar o checkout: ' + error.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar pagamento. Por favor, tente novamente.');
    }
}

// Função simplificada para verificar status (opcional)
function verificarStatusAssinatura() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        // Se temos um session_id na URL, significa que o pagamento foi bem-sucedido
        return true;
    }
    return false;
} 