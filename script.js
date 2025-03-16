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
        mostrarFeedbackNivelCompleto("Parabéns! Você completou todas as palavras deste nível!", "🎉");
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
    feedbackImagem.style.display = 'block';
    
    // Esconder a imagem de nível completo e o canvas
    document.querySelector('#imagem-nivel-completo img').style.display = 'none';
    document.getElementById('canvas-nivel-completo').style.display = 'none';
    
    mudarTela(telaFeedback);
}

function mostrarFeedbackNivelCompleto(mensagem, emoji) {
    feedbackMensagem.textContent = mensagem;
    
    // Obter elementos
    const imagemNivelCompleto = document.querySelector('#imagem-nivel-completo img');
    const canvasNivelCompleto = document.getElementById('canvas-nivel-completo');
    
    // Esconder o emoji por padrão
    feedbackImagem.style.display = 'none';
    
    // Verificar se a imagem existe e está carregada
    if (imagemNivelCompleto.complete && imagemNivelCompleto.naturalHeight !== 0) {
        // A imagem existe e está carregada
        imagemNivelCompleto.style.display = 'block';
        canvasNivelCompleto.style.display = 'none';
    } else {
        // A imagem não existe ou não carregou
        imagemNivelCompleto.style.display = 'none';
        desenharImagemFestiva(canvasNivelCompleto);
        canvasNivelCompleto.style.display = 'block';
    }
    
    mudarTela(telaFeedback);
}

function desenharImagemFestiva(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar o canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar fundo com gradiente
    const gradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width/2);
    gradient.addColorStop(0, '#ffde59');
    gradient.addColorStop(1, '#ff9f43');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Desenhar um troféu
    ctx.fillStyle = '#ffd700'; // Dourado
    
    // Base do troféu
    ctx.beginPath();
    ctx.rect(width/2 - 30, height - 40, 60, 15);
    ctx.fill();
    
    // Suporte do troféu
    ctx.beginPath();
    ctx.rect(width/2 - 5, height - 60, 10, 20);
    ctx.fill();
    
    // Taça do troféu
    ctx.beginPath();
    ctx.moveTo(width/2 - 25, height - 60);
    ctx.lineTo(width/2 - 35, height - 120);
    ctx.lineTo(width/2 + 35, height - 120);
    ctx.lineTo(width/2 + 25, height - 60);
    ctx.closePath();
    ctx.fill();
    
    // Brilho no troféu
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(width/2 - 15, height - 100, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Desenhar estrelas
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 5 + 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Desenhar texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Nunito';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PARABÉNS!', width/2, 30);
    
    // Desenhar confetes
    const cores = ['#ff6b6b', '#4d96ff', '#66bb6a', '#9c88ff', '#ffa502'];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 8 + 3;
        
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        ctx.beginPath();
        
        // Alternar entre confetes redondos e retangulares
        if (Math.random() > 0.5) {
            ctx.arc(x, y, size, 0, Math.PI * 2);
        } else {
            ctx.rect(x - size/2, y - size/2, size, size/2);
        }
        
        ctx.fill();
    }
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