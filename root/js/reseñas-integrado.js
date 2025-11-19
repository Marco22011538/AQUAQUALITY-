// js/reseñas-integrado.js
import { auth, db } from './firebase-app.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Variable global para manejar las reseñas
let reseñasManager = null;

export function initializeReseñas() {
    reseñasManager = new ReseñasManager();
    reseñasManager.init();
    return reseñasManager;
}

class ReseñasManager {
    constructor() {
        this.reseñas = [];
        this.selectedRating = 0;
        this.currentFilter = 0;
    }

    async init() {
        console.log('🔄 Inicializando sistema de reseñas...');
        await this.cargarReseñas();
        this.setupEventListeners();
        this.setupStarRating();
        this.setupFilterButtons();
    }

    async cargarReseñas() {
        try {
            console.log('📥 Cargando reseñas de Firebase...');
            const q = query(
                collection(db, 'reseñas'), 
                orderBy('fecha', 'desc')
            );

            const querySnapshot = await getDocs(q);
            this.reseñas = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                this.reseñas.push({ 
                    id: doc.id, 
                    ...data,
                    // Asegurar que la fecha se pueda mostrar
                    fechaDisplay: data.fecha ? new Date(data.fecha.toDate()).toLocaleDateString() : 'Fecha no disponible'
                });
            });

            console.log(`✅ ${this.reseñas.length} reseñas cargadas`);
            this.mostrarReseñas();
            this.actualizarEstadisticas();
            
        } catch (error) {
            console.error('❌ Error cargando reseñas:', error);
            this.mostrarError('Error al cargar las reseñas');
        }
    }

    async agregarReseña(calificacion, comentario, recomendado) {
        const user = auth.currentUser;
        
        if (!user) {
            this.mostrarError('Debes iniciar sesión para agregar una reseña');
            return false;
        }

        // Validaciones
        if (calificacion === 0) {
            this.mostrarError('Por favor selecciona una calificación');
            return false;
        }

        if (comentario.length < 10) {
            this.mostrarError('El comentario debe tener al menos 10 caracteres');
            return false;
        }

        try {
            console.log('🔍 Verificando compras del usuario...');
            
            // Verificar si el usuario ya compró algún producto
            const comprasQuery = query(
                collection(db, 'compras'),
                where('usuarioId', '==', user.uid),
                where('estado', 'in', ['completada', 'entregada'])
            );
            
            const comprasSnapshot = await getDocs(comprasQuery);
            
            if (comprasSnapshot.empty) {
                this.mostrarError('Solo puedes reseñar productos que hayas comprado. Realiza una compra primero.');
                return false;
            }

            console.log('✅ Usuario tiene compras, verificando reseña existente...');
            
            // Verificar si ya reseñó (reseña general)
            const reseñasQuery = query(
                collection(db, 'reseñas'),
                where('usuarioId', '==', user.uid),
                where('productoId', '==', 'general')
            );
            
            const reseñasSnapshot = await getDocs(reseñasQuery);
            
            if (!reseñasSnapshot.empty) {
                this.mostrarError('Ya has dejado una reseña general de nuestros productos. Solo puedes dejar una reseña por cuenta.');
                return false;
            }

            console.log('📝 Guardando reseña en Firebase...');
            
            // Agregar la reseña
            await addDoc(collection(db, 'reseñas'), {
                usuarioId: user.uid,
                usuarioEmail: user.email,
                usuarioNombre: user.displayName || 'Usuario AquaQuality',
                productoId: 'general',
                calificacion: calificacion,
                comentario: comentario.trim(),
                recomendado: recomendado,
                fecha: serverTimestamp()
            });

            console.log('✅ Reseña guardada exitosamente');
            this.mostrarExito('¡Reseña agregada exitosamente!');
            
            // Recargar las reseñas
            await this.cargarReseñas();
            
            // Limpiar formulario
            this.limpiarFormulario();
            
            return true;
            
        } catch (error) {
            console.error('❌ Error agregando reseña:', error);
            this.mostrarError('Error al agregar la reseña: ' + error.message);
            return false;
        }
    }

    mostrarReseñas() {
        const contenedor = document.getElementById('reviews-container');
        if (!contenedor) {
            console.error('❌ No se encontró el contenedor de reseñas');
            return;
        }

        // Filtrar reseñas según el filtro actual
        let reseñasFiltradas = this.reseñas;
        if (this.currentFilter > 0) {
            reseñasFiltradas = this.reseñas.filter(reseña => reseña.calificacion === this.currentFilter);
        }

        if (reseñasFiltradas.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                    <p class="text-muted">${this.currentFilter > 0 ? 'No hay reseñas con esta calificación' : 'No hay reseñas aún. ¡Sé el primero en opinar!'}</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = reseñasFiltradas.map(reseña => `
            <div class="card review-card mb-3">
                <div class="card-body">
                    <div class="review-header">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-title mb-1">${this.escapeHtml(reseña.usuarioNombre)}</h6>
                                <div class="mb-2">
                                    ${this.generarEstrellas(reseña.calificacion)}
                                    <span class="badge ${reseña.recomendado ? 'bg-success' : 'bg-danger'} ms-2">
                                        ${reseña.recomendado ? '👍 Recomendado' : '👎 No recomendado'}
                                    </span>
                                </div>
                            </div>
                            <small class="text-muted">${reseña.fechaDisplay}</small>
                        </div>
                    </div>
                    <p class="card-text">${this.escapeHtml(reseña.comentario)}</p>
                </div>
            </div>
        `).join('');
    }

    generarEstrellas(calificacion) {
        let estrellas = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= calificacion) {
                estrellas += '<i class="fas fa-star text-warning me-1"></i>';
            } else {
                estrellas += '<i class="far fa-star text-warning me-1"></i>';
            }
        }
        return estrellas;
    }

    actualizarEstadisticas() {
        const total = this.reseñas.length;
        
        if (total === 0) {
            document.querySelector('.average-rating').textContent = '0.0';
            document.getElementById('total-reviews').textContent = '0';
            
            // Resetear barras de progreso
            for (let i = 1; i <= 5; i++) {
                document.getElementById(`rating-${i}-bar`).style.width = '0%';
                document.getElementById(`rating-${i}-count`).textContent = '0';
            }
            
            // Resetear estrellas promedio
            const averageStars = document.getElementById('average-stars');
            if (averageStars) {
                averageStars.innerHTML = '<i class="far fa-star"></i>'.repeat(5);
            }
            
            return;
        }

        // Calcular promedio
        const promedio = this.reseñas.reduce((sum, reseña) => sum + reseña.calificacion, 0) / total;
        document.querySelector('.average-rating').textContent = promedio.toFixed(1);
        document.getElementById('total-reviews').textContent = total;

        // Actualizar estrellas promedio
        const averageStars = document.getElementById('average-stars');
        if (averageStars) {
            averageStars.innerHTML = this.generarEstrellas(Math.round(promedio));
        }

        // Actualizar distribución
        const distribucion = {5:0, 4:0, 3:0, 2:0, 1:0};
        this.reseñas.forEach(reseña => {
            distribucion[reseña.calificacion]++;
        });

        for (let i = 1; i <= 5; i++) {
            const porcentaje = (distribucion[i] / total) * 100;
            const bar = document.getElementById(`rating-${i}-bar`);
            const count = document.getElementById(`rating-${i}-count`);
            
            if (bar) bar.style.width = `${porcentaje}%`;
            if (count) count.textContent = distribucion[i];
        }
    }

    setupStarRating() {
        const stars = document.querySelectorAll('#rating-input .star');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.selectedRating = index + 1;
                this.updateStarDisplay();
            });
        });
    }

    updateStarDisplay() {
        const stars = document.querySelectorAll('#rating-input .star i');
        
        stars.forEach((star, index) => {
            if (index < this.selectedRating) {
                star.className = 'fas fa-star text-warning';
            } else {
                star.className = 'far fa-star text-warning';
            }
        });
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.btn-group .btn[data-rating]');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.filtrarPorRating(rating);
                
                // Actualizar estado activo
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    filtrarPorRating(rating) {
        this.currentFilter = rating;
        this.mostrarReseñas();
    }

    setupEventListeners() {
        const form = document.getElementById('formReseña');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const comentario = document.getElementById('comentario').value;
                const recomendado = document.getElementById('recomendado').checked;

                // Mostrar loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
                submitBtn.disabled = true;

                const exito = await this.agregarReseña(this.selectedRating, comentario, recomendado);

                // Restaurar botón
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                if (exito) {
                    this.limpiarFormulario();
                }
            });
        }
    }

    limpiarFormulario() {
        this.selectedRating = 0;
        this.updateStarDisplay();
        document.getElementById('comentario').value = '';
        document.getElementById('recomendado').checked = false;
    }

    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'success');
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'danger');
    }

    mostrarMensaje(mensaje, tipo) {
        // Crear toast de Bootstrap
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                        ${mensaje}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.querySelector('.toast:last-child');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Eliminar el toast después de que se oculte
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}