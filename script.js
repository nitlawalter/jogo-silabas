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
    palavraRevelada: false,
    somAtivo: true,
    audioContext: null,
    buffers: {
        acerto: null,
        erro: null
    }
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
const limparBtn = document.getElementById('limpar-btn');
const proximaBtn = document.getElementById('proxima-btn');
const voltarBtn = document.getElementById('voltar-btn');
const acertosSpan = document.getElementById('acertos');
const nivelAtualSpan = document.getElementById('nivel-atual');
const feedbackMensagem = document.getElementById('feedback-mensagem');
const feedbackImagem = document.getElementById('feedback-imagem');
const continuarBtn = document.getElementById('continuar-btn');
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');
const botaoSom = document.getElementById('botao-som');

// Inicialização
document.addEventListener('DOMContentLoaded', iniciarJogo);

// Garantir que os sons sejam carregados
window.addEventListener('load', () => {
    console.log('Página carregada, verificando sons...');
    
    // Carregar sons
    const sons = [somAcerto, somErro];
    sons.forEach(som => {
        if (som) {
            console.log(`Verificando som ${som.id}:`, {
                readyState: som.readyState,
                src: som.src,
                error: som.error
            });
            
            // Forçar carregamento do som
            som.load();
            
            // Adicionar listeners para debug
            som.addEventListener('canplaythrough', () => {
                console.log(`Som ${som.id} carregado e pronto para reprodução`);
            });
            
            som.addEventListener('error', (e) => {
                console.error(`Erro ao carregar som ${som.id}:`, e);
            });
            
            som.addEventListener('play', () => {
                console.log(`Som ${som.id} começou a tocar`);
            });
            
            som.addEventListener('ended', () => {
                console.log(`Som ${som.id} terminou de tocar`);
            });
        } else {
            console.error(`Elemento de som não encontrado`);
        }
    });
});

function iniciarJogo() {
    // Adicionar event listeners aos botões de nível
    botoesNivel.forEach(botao => {
        botao.addEventListener('click', () => {
            const nivel = parseInt(botao.dataset.nivel);
            iniciarNivel(nivel);
        });
    });

    // Verificar se os botões estão sendo encontrados corretamente
    console.log("Botão verificar:", verificarBtn);
    console.log("Botão limpar:", limparBtn);
    console.log("Botão próxima:", proximaBtn);
    console.log("Botão voltar:", voltarBtn);
    console.log("Botão som:", botaoSom);

    // Event listeners para os botões de controle
    if (verificarBtn) verificarBtn.addEventListener('click', verificarResposta);
    
    // Garantir que o botão limpar tenha um event listener
    if (limparBtn) {
        console.log("Adicionando event listener ao botão limpar");
        limparBtn.addEventListener('click', function() {
            console.log("Botão limpar clicado!");
            limparAreaResposta();
        });
    } else {
        console.error("Botão limpar não encontrado!");
    }
    
    if (proximaBtn) proximaBtn.addEventListener('click', proximaPalavra);
    if (voltarBtn) voltarBtn.addEventListener('click', voltarAoMenu);
    if (continuarBtn) continuarBtn.addEventListener('click', fecharFeedback);
    
    // Event listener para o botão de mostrar/ocultar palavra
    if (togglePalavraBtn) togglePalavraBtn.addEventListener('click', togglePalavra);

    // Event listener para o botão de som
    if (botaoSom) {
        botaoSom.addEventListener('click', toggleSom);
        atualizarBotaoSom();
        
        // Adicionar evento de clique duplo para testar os sons
        botaoSom.addEventListener('dblclick', () => {
            console.log('Testando sons...');
            tocarSom(somAcerto);
            setTimeout(() => tocarSom(somErro), 1000);
        });
    }

    // Configurar drag and drop
    configurarDragAndDrop();
    
    // Configurar clique nas sílabas para removê-las
    configurarRemocaoSilabas();

    // Inicializar áudio quando o usuário interagir
    document.body.addEventListener('click', () => {
        if (!estadoJogo.audioContext) {
            inicializarAudio();
        }
    }, { once: true });
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
    
    // Iniciar sessão de progresso
    iniciarNovoNivel(nivel);
    
    // Carregar primeira palavra
    carregarNovaPalavra();
}

function carregarNovaPalavra() {
    // Resetar botão próxima
    proximaBtn.disabled = true;
    
    // Resetar estado da palavra revelada
    estadoJogo.palavraRevelada = false;
    atualizarVisualizacaoPalavra();
    
    // Iniciar nova tentativa para registro de progresso
    iniciarNovaPalavra();
    
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

function configurarRemocaoSilabas() {
    console.log("Configurando remoção de sílabas...");
    
    // Usar delegação de eventos para capturar cliques nas sílabas
    areaResposta.addEventListener('click', function(e) {
        // Verificar se o clique foi em uma sílaba
        if (e.target.classList.contains('silaba')) {
            console.log("Clique em sílaba detectado:", e.target.textContent);
            
            // Remover a classe 'preenchido' do espaço
            e.target.parentElement.classList.remove('preenchido');
            
            // Mover a sílaba de volta para o container
            silabasContainer.appendChild(e.target);
        }
    });
}

function limparAreaResposta() {
    console.log("Limpando área de resposta...");
    
    // Obter todas as sílabas na área de resposta
    const silabas = Array.from(areaResposta.querySelectorAll('.silaba'));
    console.log("Sílabas encontradas:", silabas.length);
    
    // Mover cada sílaba de volta para o container
    silabas.forEach(silaba => {
        // Remover a classe 'preenchido' do espaço
        silaba.parentElement.classList.remove('preenchido');
        
        // Mover a sílaba de volta para o container
        silabasContainer.appendChild(silaba);
    });
}

function verificarResposta() {
    const silabasColocadas = Array.from(areaResposta.children)
        .map(espaco => espaco.textContent)
        .filter(silaba => silaba !== '');

    if (silabasColocadas.length !== estadoJogo.palavraAtual.silabas.length) {
        mostrarFeedback("Complete todas as sílabas!", "❌");
        if (estadoJogo.somAtivo) tocarSom(somErro);
        return;
    }

    const palavraFormada = silabasColocadas.join('');
    const correto = palavraFormada === estadoJogo.palavraAtual.palavra;

    // Registrar tentativa no progresso
    verificarTentativa(estadoJogo.palavraAtual.palavra, correto);

    if (correto) {
        estadoJogo.acertos++;
        acertosSpan.textContent = `Acertos: ${estadoJogo.acertos}`;
        
        // Tocar som de acerto
        tocarSom('acerto');
        
        Array.from(areaResposta.children).forEach(espaco => {
            espaco.firstChild.classList.add('animacao-acerto');
        });
        
        estadoJogo.palavraRevelada = true;
        atualizarVisualizacaoPalavra();
        
        mostrarFeedback("Muito bem! Você acertou!", "🎉");
        
        proximaBtn.disabled = false;
        proximaBtn.focus();
    } else {
        // Tocar som de erro
        tocarSom('erro');
        
        mostrarFeedback("Ops! Tente novamente!", "😕");
        
        Array.from(areaResposta.children).forEach(espaco => {
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

function toggleSom() {
    estadoJogo.somAtivo = !estadoJogo.somAtivo;
    atualizarBotaoSom();
}

function atualizarBotaoSom() {
    if (botaoSom) {
        botaoSom.textContent = estadoJogo.somAtivo ? '🔊' : '🔇';
        botaoSom.title = estadoJogo.somAtivo ? 'Desativar Som' : 'Ativar Som';
    }
}

function tocarSom(tipo) {
    if (!estadoJogo.somAtivo) {
        console.log('Som desativado, ignorando reprodução');
        return;
    }

    // Se o contexto de áudio ainda não foi inicializado, inicialize-o
    if (!estadoJogo.audioContext) {
        inicializarAudio().then(() => {
            const buffer = tipo === 'acerto' ? estadoJogo.buffers.acerto : estadoJogo.buffers.erro;
            tocarBuffer(buffer);
        });
        return;
    }

    // Se o contexto já existe, toque o som diretamente
    const buffer = tipo === 'acerto' ? estadoJogo.buffers.acerto : estadoJogo.buffers.erro;
    tocarBuffer(buffer);
}

// Função para inicializar o contexto de áudio
async function inicializarAudio() {
    try {
        // Criar contexto de áudio
        estadoJogo.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Carregar os sons
        const [acertoBuffer, erroBuffer] = await Promise.all([
            carregarSom('sons/acerto.wav'),
            carregarSom('sons/erro.wav')
        ]);
        
        estadoJogo.buffers.acerto = acertoBuffer;
        estadoJogo.buffers.erro = erroBuffer;
        
        console.log('Sons carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar áudio:', error);
    }
}

// Função para carregar um arquivo de som
async function carregarSom(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await estadoJogo.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error(`Erro ao carregar som ${url}:`, error);
        return null;
    }
}

// Função para tocar um buffer de som
function tocarBuffer(buffer) {
    if (!estadoJogo.somAtivo || !estadoJogo.audioContext || !buffer) {
        return;
    }

    try {
        const source = estadoJogo.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(estadoJogo.audioContext.destination);
        source.start(0);
    } catch (error) {
        console.error('Erro ao tocar som:', error);
    }
} 