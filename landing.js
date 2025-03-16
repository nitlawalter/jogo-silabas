document.addEventListener('DOMContentLoaded', function() {
    // Animação de scroll suave para links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Slider de depoimentos
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    function showSlide(index) {
        // Esconder todos os slides
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
        });
        
        // Remover classe ativa de todos os dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Mostrar o slide atual
        testimonials[index].style.display = 'block';
        
        // Adicionar classe ativa ao dot atual
        dots[index].classList.add('active');
    }
    
    // Inicializar o slider
    showSlide(currentSlide);
    
    // Adicionar evento de clique aos dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            currentSlide = index;
        });
    });
    
    // Avançar slide automaticamente a cada 5 segundos
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    }, 5000);
    
    // Animação de elementos ao scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.benefit-card, .step, .pricing-card, .faq-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Inicializar elementos com opacidade 0 e translateY
    document.querySelectorAll('.benefit-card, .step, .pricing-card, .faq-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Executar animação ao carregar a página
    animateOnScroll();
    
    // Executar animação ao scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Botão de play do vídeo
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Aqui seria reproduzido um vídeo de demonstração do jogo!');
        });
    }
}); 