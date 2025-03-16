// Banco de palavras por nível (número de sílabas)
const bancoPalavras = {
    2: [
        { palavra: "GATO", silabas: ["GA", "TO"], imagem: "imagens/gato.png" },
        { palavra: "CASA", silabas: ["CA", "SA"], imagem: "imagens/casa.png" },
        { palavra: "BOLA", silabas: ["BO", "LA"], imagem: "imagens/bola.png" },
        { palavra: "PATO", silabas: ["PA", "TO"], imagem: "imagens/pato.png" },
        { palavra: "SAPO", silabas: ["SA", "PO"], imagem: "imagens/sapo.png" }
    ],
    3: [
        { palavra: "BANANA", silabas: ["BA", "NA", "NA"], imagem: "imagens/banana.png" },
        { palavra: "MACACO", silabas: ["MA", "CA", "CO"], imagem: "imagens/macaco.png" },
        { palavra: "SAPATO", silabas: ["SA", "PA", "TO"], imagem: "imagens/sapato.png" },
        { palavra: "CAVALO", silabas: ["CA", "VA", "LO"], imagem: "imagens/cavalo.png" },
        { palavra: "BONECA", silabas: ["BO", "NE", "CA"], imagem: "imagens/boneca.png" }
    ],
    4: [
        { palavra: "BORBOLETA", silabas: ["BOR", "BO", "LE", "TA"], imagem: "imagens/borboleta.png" },
        { palavra: "CHOCOLATE", silabas: ["CHO", "CO", "LA", "TE"], imagem: "imagens/chocolate.png" },
        { palavra: "BICICLETA", silabas: ["BI", "CI", "CLE", "TA"], imagem: "imagens/bicicleta.png" },
        { palavra: "ELEFANTE", silabas: ["E", "LE", "FAN", "TE"], imagem: "imagens/elefante.png" },
        { palavra: "ABACAXI", silabas: ["A", "BA", "CA", "XI"], imagem: "imagens/abacaxi.png" }
    ]
};

// Estado do jogo
let estadoJogo = {
    nivelAtual: 2,
    palavraAtual: null,
    silabasEmbaralhadas: [],
    acertos: 0,
    palavrasJogadas: [],
    silabaArrastando: null,
    palavraRevelada: false
};

// Elementos do DOM
const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const telaFeedback = document.getElementById('tela-feedback');
const botoesNivel = document.querySelectorAll('.nivel-btn');
const imagemPalavra = document.getElementById('imagem-palavra');
const palavraOculta = document.getElementById('palavra-oculta');
const togglePalavraBtn = document.getElementById('toggle-palavra');
const areaResposta = document.getElementById('area-resposta');
const silabasContainer = document.getElementById('silabas-container');
const verificarBtn = document.getElementById('verificar-btn');
const proximaBtn = document.getElementById('proxima-btn');
const voltarBtn = document.getElementById('voltar-btn');
const acertosSpan = document.getElementById('acertos');
const nivelAtualSpan = document.getElementById('nivel-atual');
const feedbackMensagem = document.getElementById('feedback-mensagem');
const feedbackImagem = document.getElementById('feedback-imagem');
const continuarBtn = document.getElementById('continuar-btn');
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Inicialização
document.addEventListener('DOMContentLoaded', iniciarJogo);

function iniciarJogo() {
    // Adicionar event listeners aos botões de nível
    botoesNivel.forEach(botao => {
        botao.addEventListener('click', () => {
            const nivel = parseInt(botao.dataset.nivel);
            iniciarNivel(nivel);
        });
    });

    // Event listeners para os botões de controle
    verificarBtn.addEventListener('click', verificarResposta);
    proximaBtn.addEventListener('click', proximaPalavra);
    voltarBtn.addEventListener('click', voltarAoMenu);
    continuarBtn.addEventListener('click', fecharFeedback);
    
    // Event listener para o botão de mostrar/ocultar palavra
    togglePalavraBtn.addEventListener('click', togglePalavra);

    // Configurar drag and drop
    configurarDragAndDrop();
}

function iniciarNivel(nivel) {
    // Atualizar estado do jogo
    estadoJogo.nivelAtual = nivel;
    estadoJogo.acertos = 0;
    estadoJogo.palavrasJogadas = [];
    estadoJogo.palavraRevelada = false;
    
    // Atualizar UI
    nivelAtualSpan.textContent = `Nível: ${nivel} Sílabas`;
    acertosSpan.textContent = `Acertos: ${estadoJogo.acertos}`;
    
    // Mudar para a tela de jogo
    mudarTela(telaJogo);
    
    // Carregar primeira palavra
    carregarNovaPalavra();
}

function carregarNovaPalavra() {
    // Resetar botão próxima
    proximaBtn.disabled = true;
    
    // Resetar estado da palavra revelada
    estadoJogo.palavraRevelada = false;
    atualizarVisualizacaoPalavra();
    
    // Obter palavras disponíveis para o nível atual
    const palavrasDisponiveis = bancoPalavras[estadoJogo.nivelAtual].filter(
        p => !estadoJogo.palavrasJogadas.includes(p.palavra)
    );
    
    // Verificar se ainda há palavras disponíveis
    if (palavrasDisponiveis.length === 0) {
        mostrarFeedback("Parabéns! Você completou todas as palavras deste nível!", "🎉");
        return;
    }
    
    // Selecionar palavra aleatória
    const indiceAleatorio = Math.floor(Math.random() * palavrasDisponiveis.length);
    estadoJogo.palavraAtual = palavrasDisponiveis[indiceAleatorio];
    estadoJogo.palavrasJogadas.push(estadoJogo.palavraAtual.palavra);
    
    // Embaralhar sílabas
    estadoJogo.silabasEmbaralhadas = [...estadoJogo.palavraAtual.silabas];
    embaralharArray(estadoJogo.silabasEmbaralhadas);
    
    // Atualizar imagem
    imagemPalavra.src = estadoJogo.palavraAtual.imagem;
    imagemPalavra.alt = `Imagem de ${estadoJogo.palavraAtual.palavra}`;
    
    // Atualizar palavra oculta
    atualizarVisualizacaoPalavra();
    
    // Criar espaços para as sílabas na área de resposta
    areaResposta.innerHTML = '';
    for (let i = 0; i < estadoJogo.palavraAtual.silabas.length; i++) {
        const espacoSilaba = document.createElement('div');
        espacoSilaba.className = 'espaco-silaba';
        espacoSilaba.dataset.posicao = i;
        areaResposta.appendChild(espacoSilaba);
    }
    
    // Criar sílabas embaralhadas
    silabasContainer.innerHTML = '';
    estadoJogo.silabasEmbaralhadas.forEach((silaba, index) => {
        const elementoSilaba = document.createElement('div');
        elementoSilaba.className = 'silaba';
        elementoSilaba.textContent = silaba;
        elementoSilaba.dataset.silaba = silaba;
        elementoSilaba.dataset.index = index;
        elementoSilaba.draggable = true;
        silabasContainer.appendChild(elementoSilaba);
    });
}

function togglePalavra() {
    estadoJogo.palavraRevelada = !estadoJogo.palavraRevelada;
    atualizarVisualizacaoPalavra();
}

function atualizarVisualizacaoPalavra() {
    if (estadoJogo.palavraAtual) {
        if (estadoJogo.palavraRevelada) {
            palavraOculta.textContent = estadoJogo.palavraAtual.palavra;
            palavraOculta.classList.add('revelada');
            togglePalavraBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            togglePalavraBtn.title = "Ocultar palavra";
        } else {
            palavraOculta.textContent = "?????";
            palavraOculta.classList.remove('revelada');
            togglePalavraBtn.innerHTML = '<i class="fas fa-eye"></i>';
            togglePalavraBtn.title = "Mostrar palavra";
        }
    }
}

function configurarDragAndDrop() {
    // Delegação de eventos para as sílabas (que são criadas dinamicamente)
    silabasContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('silaba')) {
            e.target.classList.add('arrastando');
            estadoJogo.silabaArrastando = e.target;
            e.dataTransfer.setData('text/plain', e.target.dataset.silaba);
            e.dataTransfer.effectAllowed = 'move';
        }
    });
    
    silabasContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('silaba')) {
            e.target.classList.remove('arrastando');
            estadoJogo.silabaArrastando = null;
        }
    });
    
    // Delegação de eventos para os espaços de sílabas
    areaResposta.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('espaco-silaba') && !e.target.hasChildNodes()) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    });
    
    areaResposta.addEventListener('drop', (e) => {
        if (e.target.classList.contains('espaco-silaba') && !e.target.hasChildNodes()) {
            e.preventDefault();
            const silaba = estadoJogo.silabaArrastando;
            
            if (silaba) {
                e.target.appendChild(silaba);
                e.target.classList.add('preenchido');
                silaba.classList.remove('arrastando');
                
                // Verificar se todos os espaços estão preenchidos
                const todosPreenchidos = Array.from(
                    document.querySelectorAll('.espaco-silaba')
                ).every(espaco => espaco.hasChildNodes());
                
                if (todosPreenchidos) {
                    verificarBtn.focus();
                }
            }
        }
    });
    
    // Permitir que as sílabas sejam arrastadas de volta
    areaResposta.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('silaba')) {
            e.target.classList.add('arrastando');
            estadoJogo.silabaArrastando = e.target;
            e.dataTransfer.setData('text/plain', e.target.dataset.silaba);
            e.dataTransfer.effectAllowed = 'move';
            e.target.parentElement.classList.remove('preenchido');
        }
    });
    
    silabasContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    silabasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const silaba = estadoJogo.silabaArrastando;
        
        if (silaba && silaba.parentElement.classList.contains('espaco-silaba')) {
            silaba.parentElement.classList.remove('preenchido');
            silabasContainer.appendChild(silaba);
            silaba.classList.remove('arrastando');
        }
    });
}

function verificarResposta() {
    // Verificar se todos os espaços estão preenchidos
    const espacos = document.querySelectorAll('.espaco-silaba');
    const todosPreenchidos = Array.from(espacos).every(espaco => espaco.hasChildNodes());
    
    if (!todosPreenchidos) {
        mostrarFeedback("Complete todas as sílabas antes de verificar!", "🤔");
        return;
    }
    
    // Obter a sequência de sílabas colocada pelo jogador
    const sequenciaJogador = Array.from(espacos).map(
        espaco => espaco.firstChild.textContent
    );
    
    // Verificar se a sequência está correta
    const sequenciaCorreta = estadoJogo.palavraAtual.silabas;
    const respostaCorreta = sequenciaJogador.every(
        (silaba, index) => silaba === sequenciaCorreta[index]
    );
    
    if (respostaCorreta) {
        // Atualizar acertos
        estadoJogo.acertos++;
        acertosSpan.textContent = `Acertos: ${estadoJogo.acertos}`;
        
        // Tocar som de acerto
        somAcerto.play();
        
        // Animar sílabas
        espacos.forEach(espaco => {
            espaco.firstChild.classList.add('animacao-acerto');
        });
        
        // Revelar a palavra
        estadoJogo.palavraRevelada = true;
        atualizarVisualizacaoPalavra();
        
        // Mostrar feedback positivo
        mostrarFeedback("Muito bem! Você acertou!", "🎉");
        
        // Habilitar botão próxima
        proximaBtn.disabled = false;
        proximaBtn.focus();
    } else {
        // Tocar som de erro
        somErro.play();
        
        // Mostrar feedback negativo
        mostrarFeedback("Ops! Tente novamente!", "😕");
        
        // Devolver sílabas para o container
        Array.from(espacos).forEach(espaco => {
            if (espaco.firstChild) {
                const silaba = espaco.firstChild;
                espaco.classList.remove('preenchido');
                silabasContainer.appendChild(silaba);
            }
        });
    }
}

function proximaPalavra() {
    carregarNovaPalavra();
}

function voltarAoMenu() {
    mudarTela(telaInicial);
}

function mostrarFeedback(mensagem, emoji) {
    feedbackMensagem.textContent = mensagem;
    feedbackImagem.textContent = emoji;
    mudarTela(telaFeedback);
}

function fecharFeedback() {
    mudarTela(telaJogo);
}

function mudarTela(telaAlvo) {
    // Esconder todas as telas
    telaInicial.classList.remove('ativa');
    telaJogo.classList.remove('ativa');
    telaFeedback.classList.remove('ativa');
    
    // Mostrar a tela alvo
    telaAlvo.classList.add('ativa');
}

// Função auxiliar para embaralhar array
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
} 