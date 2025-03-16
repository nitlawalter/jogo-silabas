# Jogo das Sílabas

Um jogo educativo para crianças aprenderem a formar palavras juntando sílabas.

## Sobre o Jogo

Este jogo foi desenvolvido para ajudar crianças no processo de alfabetização, permitindo que elas aprendam a formar palavras através da junção de sílabas. O jogo apresenta uma interface colorida e amigável, com diferentes níveis de dificuldade.

### Funcionalidades

- **Níveis de dificuldade**: Palavras com 2, 3 ou 4 sílabas
- **Sistema de arrastar e soltar**: Interface intuitiva para crianças
- **Feedback visual e sonoro**: Reforço positivo para acertos
- **Imagens ilustrativas**: Associação visual com as palavras
- **Design responsivo**: Funciona em diferentes dispositivos

## Como Jogar

1. Escolha o nível de dificuldade (2, 3 ou 4 sílabas)
2. Observe a imagem que representa a palavra
3. Arraste as sílabas embaralhadas para a área de resposta na ordem correta
4. Clique em "Verificar" para conferir sua resposta
5. Se estiver correto, avance para a próxima palavra
6. Se estiver errado, tente novamente

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- API de Drag and Drop do HTML5

## Estrutura do Projeto

```
jogo-silabas/
├── index.html        # Página principal do jogo
├── styles.css        # Estilos CSS
├── script.js         # Lógica do jogo
├── imagens/          # Imagens das palavras
├── sons/             # Sons de feedback
└── README.md         # Este arquivo
```

## Instalação e Execução

1. Clone este repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Não é necessário instalar dependências adicionais

## Personalização

Você pode adicionar novas palavras editando o objeto `bancoPalavras` no arquivo `script.js`. Para cada palavra, você precisa:

1. Adicionar a palavra em letras maiúsculas
2. Dividir a palavra em sílabas (array de strings)
3. Adicionar o caminho para a imagem correspondente

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- Adicionar novas palavras e imagens
- Melhorar a interface do usuário
- Adicionar novos recursos educativos
- Corrigir bugs ou problemas de usabilidade

## Licença

Este projeto está licenciado sob a licença MIT. 