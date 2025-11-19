// Script para AQUAQUALITY - Sistema IoT de Monitoreo de Calidad de Agua
document.addEventListener('DOMContentLoaded', function () {
    const body = document.getElementById('main-body');
    const toggleScrollClass = () => {
        // Si el scroll vertical es mayor a 100px (o cualquier valor que desees)
        if (window.scrollY > 100) {
            body.classList.add('scrolled-contrast');
        } else {
            body.classList.remove('scrolled-contrast');
        }
    };

    // Ejecuta la función al cargar y en cada scroll
    window.addEventListener('scroll', toggleScrollClass);
    toggleScrollClass(); // Ejecutar una vez al cargar por si la página ya está desplazada
});
// root/js/email.js - Script para el formulario de contacto con EmailJS

// Inicializa EmailJS con tu clave pública
(function(){
    emailjs.init("lTymgDEM0lHLCekSP"); // ⚠️ Reemplázala por la tuya si es necesario
})();

// Configura el evento de envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formularioContacto');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();

            const boton = this.querySelector('button');
            const mensajeDiv = document.getElementById('mensaje');

            boton.textContent = 'Enviando...';
            boton.disabled = true;
            mensajeDiv.style.display = 'none';

            emailjs.sendForm('service_r2tuf7l', 'template_xk60mwa', this)
            .then(function() {
                mensajeDiv.textContent = '✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.';
                mensajeDiv.className = 'alert alert-success';
                mensajeDiv.style.display = 'block';
                document.getElementById('formularioContacto').reset();
            }, function(error) {
                mensajeDiv.textContent = '❌ Error al enviar el mensaje. Intenta nuevamente.';
                mensajeDiv.className = 'alert alert-danger';
                mensajeDiv.style.display = 'block';
                console.error('Error EmailJS:', error);
            })
            .finally(() => {
                boton.textContent = 'Enviar Mensaje';
                boton.disabled = false;
            });
        });
    }
});
