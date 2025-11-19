(function() {
  // Inicializa EmailJS con tu clave pública
  emailjs.init("lTymgDEM0lHLCekSP"); // ⚠️ Reemplázala por tu clave pública real
})();

document.getElementById('formularioContacto').addEventListener('submit', function(e) {
  e.preventDefault();

  const boton = this.querySelector('button');
  const mensajeDiv = document.getElementById('mensaje');

  boton.textContent = 'Enviando...';
  boton.disabled = true;
  mensajeDiv.style.display = 'none';

  emailjs.sendForm('service_r2tuf7l', 'template_xk60mwa', this)
    .then(function() {
      mensajeDiv.textContent = '✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.';
      mensajeDiv.className = 'mensaje exito';
      mensajeDiv.style.display = 'block';
      document.getElementById('formularioContacto').reset();
    }, function(error) {
      mensajeDiv.textContent = '❌ Error al enviar el mensaje. Intenta nuevamente.';
      mensajeDiv.className = 'mensaje error';
      mensajeDiv.style.display = 'block';
      console.error('Error:', error);
    })
    .finally(() => {
      boton.textContent = 'Enviar Mensaje';
      boton.disabled = false;
    });
});
