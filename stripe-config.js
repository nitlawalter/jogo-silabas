// Configuração do Stripe
const stripe = Stripe('pk_test_51QnOvRRxVP7yohx400reSRiVM6Uz52b5eoElO7OS1CS46HvUY2hFRsqpUkJcSd5hTbifgz8pXq9PoW8fYzDFGbj500KUopywlQ');

// Função para criar uma sessão de checkout
async function criarSessaoCheckout(priceId) {
    try {
        const response = await fetch('http://localhost:3000/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priceId })
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        throw error;
    }
}

// Função para redirecionar para o checkout
async function iniciarCheckout(priceId) {
    try {
        const { sessionId } = await criarSessaoCheckout(priceId);
        const result = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (result.error) {
            console.error(result.error);
            alert('Erro ao iniciar o checkout. Por favor, tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar pagamento. Por favor, tente novamente.');
    }
}

// Função para verificar status da assinatura
async function verificarStatusAssinatura(sessionId) {
    try {
        const response = await fetch(`http://localhost:3000/check-session/${sessionId}`);
        const data = await response.json();
        return data.paid;
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        return false;
    }
} 