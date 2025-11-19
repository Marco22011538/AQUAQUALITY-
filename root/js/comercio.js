// Script para COMERCIO - Sistema de Monitoreo de Agua Purificada
document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;
    const toggleScrollClass = () => {
        if (window.scrollY > 100) {
            body.classList.add('scrolled-contrast');
        } else {
            body.classList.remove('scrolled-contrast');
        }
    };

    window.addEventListener('scroll', toggleScrollClass);
    toggleScrollClass();
    
    // Configurar estrellas de rating
    setupStarRating();
});

function setupStarRating() {
    const stars = document.querySelectorAll('#rating-input .star');
    const selectedRatingInput = document.getElementById('selected-rating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRatingInput.value = rating;
            
            // Actualizar visualización de estrellas
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.innerHTML = '<i class="fas fa-star text-warning"></i>';
                } else {
                    s.innerHTML = '<i class="far fa-star text-warning"></i>';
                }
            });
        });
        
        // Efecto hover
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.innerHTML = '<i class="fas fa-star text-warning"></i>';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(selectedRatingInput.value);
            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.innerHTML = '<i class="far fa-star text-warning"></i>';
                }
            });
        });
    });
}