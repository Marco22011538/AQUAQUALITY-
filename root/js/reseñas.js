// reseñas.js - VERSIÓN FIRESTORE MEJORADA
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    doc,
    setDoc,
    getDocs,
    where 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBDlRaG4FctisIuvbQI_pK34gxxH0usHSM",
  authDomain: "aquaquality.firebaseapp.com",
  databaseURL: "https://aquaquality-default-rdb.firebaseio.com",
  projectId: "aquaquality",
  storageBucket: "aquaquality.firebasestorage.app",
  messagingSenderId: "1098965693425",
  appId: "1:1098965693425:web:cb1995f7b65591f40b8a50"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const reviewsCollection = collection(db, "reseñas");

// Variables globales
let selectedRating = 0;
let allReviews = [];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Inicializando sistema de reseñas con Firestore...');
    initializeReviewSystem();
});

function initializeReviewSystem() {
    console.log('⭐ Configurando sistema de reseñas Firestore...');
    setupStarRating();
    setupReviewForm();
    setupFilterButtons();
    loadExistingReviews();
    loadUserReviews();
}

function setupStarRating() {
    const stars = document.querySelectorAll('#rating-input .star');
    console.log('🔍 Estrellas encontradas:', stars.length);
    
    stars.forEach((star, index) => {
        // LIMPIAR event listeners anteriores
        star.replaceWith(star.cloneNode(true));
    });

    // VOLVER A SELECCIONAR después de clonar
    const newStars = document.querySelectorAll('#rating-input .star');
    
    newStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            console.log('✅ Calificación seleccionada:', selectedRating);
            updateStarDisplay();
        });
        
        star.addEventListener('mouseover', () => {
            const stars = document.querySelectorAll('#rating-input .star i');
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.style.color = '#ffc107';
                }
            });
        });
        
        star.addEventListener('mouseout', () => {
            updateStarDisplay();
        });
    });
    
    console.log('⭐ Sistema de estrellas configurado');
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('#rating-input .star i');
    
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.className = 'fas fa-star';
            star.style.color = '#ffc107';
        } else {
            star.className = 'far fa-star';
            star.style.color = '#ddd';
        }
    });
    
    document.getElementById('selected-rating').value = selectedRating;
}

function setupReviewForm() {
    const form = document.getElementById('formReseña');
    if (!form) {
        console.error('❌ No se encuentra el formulario de reseñas');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('🟡 ========== INICIANDO ENVÍO DE RESEÑA FIRESTORE ==========');
        
        // SOLUCIÓN DEFINITIVA: Leer las estrellas visuales directamente
        const estrellasSeleccionadas = document.querySelectorAll('#rating-input .star i.fas').length;
        
        console.log('🔍 Estrellas visuales encontradas:', estrellasSeleccionadas);

        // VALIDACIÓN CRÍTICA
        if (estrellasSeleccionadas === 0) {
            alert('Por favor selecciona una calificación con las estrellas');
            return;
        }

        const comentario = document.getElementById('comentario').value.trim();
        if (comentario.length < 10) {
            alert('La reseña debe tener al menos 10 caracteres');
            return;
        }

        const recomendado = document.getElementById('recomendado').checked;

        console.log('✅ Validaciones pasadas:', {
            estrellas: estrellasSeleccionadas,
            comentario: comentario,
            recomendado: recomendado
        });

        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
        submitBtn.disabled = true;

        try {
            console.log('🟡 Obteniendo usuario auth...');
            
            let usuarioNombre = 'Cliente AquaQuality';
            let usuarioId = null;
            let usuarioEmail = '';
            let usuarioVerificado = false;
            
            // OBTENER USUARIO ACTUAL
            try {
                const { auth } = await import('./firebase-app.js');
                const user = auth.currentUser;
                console.log('🔍 Estado de autenticación:', user ? 'Usuario logueado' : 'No logueado');
                
                if (user) {
                    usuarioId = user.uid;
                    usuarioEmail = user.email || '';
                    usuarioNombre = user.displayName || user.email.split('@')[0] || 'Usuario AquaQuality';
                    usuarioVerificado = user.emailVerified || false;
                    console.log('✅ Usuario autenticado:', { 
                        nombre: usuarioNombre, 
                        id: usuarioId,
                        verificado: usuarioVerificado 
                    });
                }
            } catch (authError) {
                console.warn('⚠️ Error en auth (continuando como anónimo):', authError);
            }

            console.log('🟡 Preparando datos de reseña Firestore...');
            
            // DATOS DE LA RESEÑA - FIRESTORE
            const reviewData = { 
                usuarioNombre: usuarioNombre,
                usuarioEmail: usuarioEmail,
                usuarioId: usuarioId,
                usuarioVerificado: usuarioVerificado, // NUEVO: Estado de verificación
                calificacion: estrellasSeleccionadas,
                comentario: comentario,
                recomendado: recomendado,
                fecha: new Date().toLocaleDateString('es-ES'),
                timestamp: new Date(),
                fechaCreacion: new Date() // Para ordenamiento en Firestore
            };
            
            console.log('📦 Datos finales a enviar a Firestore:', reviewData);

            console.log('🟡 Iniciando guardado en Firestore...');
            
            // 1. GUARDAR EN COLECCIÓN PRINCIPAL
            try {
                console.log('📝 Guardando en colección reseñas...');
                const docRef = await addDoc(reviewsCollection, reviewData);
                console.log('✅ Reseña guardada en Firestore con ID:', docRef.id);
            } catch (firestoreError) {
                console.error('❌ Error guardando en Firestore:', firestoreError);
                throw new Error(`Error al guardar reseña: ${firestoreError.message}`);
            }
            
            // 2. GUARDAR EN SUBCOLECCIÓN DE USUARIO (si está logueado)
            if (usuarioId) {
                try {
                    console.log('📝 Guardando en subcolección de usuario...');
                    const userReviewRef = doc(db, "usuarios", usuarioId, "misReseñas", Date.now().toString());
                    await setDoc(userReviewRef, reviewData);
                    console.log('✅ Reseña guardada en perfil del usuario');
                } catch (userError) {
                    console.warn('⚠️ Error guardando en perfil de usuario:', userError);
                }
            }
            
            console.log('🎉 ¡Reseña enviada exitosamente a Firestore!');
            
            // ÉXITO - Mostrar mensaje y limpiar
            alert('¡Reseña enviada exitosamente!');
            
            // Limpiar formulario
            form.reset();
            selectedRating = 0; // IMPORTANTE: Resetear variable global
            updateStarDisplay();
            
        } catch (error) {
            console.error('❌ ERROR CRÍTICO EN ENVÍO:', error);
            console.error('❌ Stack:', error.stack);
            alert('Error al enviar la reseña: ' + error.message);
        } finally {
            console.log('🟡 Restaurando botón...');
            // SIEMPRE restaurar el botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            console.log('✅ Botón restaurado');
        }
        
        console.log('🔚 ========== FINALIZADO ENVÍO DE RESEÑA ==========');
    });
}

function loadUserReviews() {
    console.log('🟡 Cargando reseñas del usuario desde Firestore...');
    
    import('./firebase-app.js')
        .then(({ auth }) => {
            const user = auth.currentUser;
            
            if (!user) {
                console.log('👤 Usuario no logueado, no se cargan reseñas personales');
                displayUserReviews([]);
                return;
            }

            const userReviewsRef = collection(db, "usuarios", user.uid, "misReseñas");
            const q = query(userReviewsRef, orderBy("timestamp", "desc"));
            
            onSnapshot(q, (snapshot) => {
                const userReviews = [];
                snapshot.forEach((doc) => {
                    userReviews.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`👤 ${userReviews.length} reseñas personales cargadas desde Firestore`);
                displayUserReviews(userReviews);
            }, (error) => {
                console.error('❌ Error escuchando reseñas de usuario:', error);
            });

        })
        .catch(error => {
            console.warn('⚠️ No se pudo cargar auth para reseñas de usuario:', error);
            displayUserReviews([]);
        });
}

function displayUserReviews(userReviews) {
    let userReviewsSection = document.getElementById('user-reviews-section');
    
    if (!userReviewsSection) {
        userReviewsSection = document.createElement('div');
        userReviewsSection.id = 'user-reviews-section';
        userReviewsSection.className = 'mt-5';
        userReviewsSection.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="mb-0 border-bottom border-primary pb-2">Mis Reseñas</h4>
                <span class="badge bg-primary">${userReviews.length} reseñas</span>
            </div>
            <div id="user-reviews-container"></div>
        `;
        
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer && reviewsContainer.parentNode) {
            reviewsContainer.parentNode.insertBefore(userReviewsSection, reviewsContainer.nextSibling);
        }
    }

    const container = document.getElementById('user-reviews-container');
    
    if (userReviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aún no has escrito ninguna reseña</p>
                <small class="text-muted">¡Sé el primero en compartir tu experiencia!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = userReviews.map(review => `
        <div class="card mb-3 border-primary">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title mb-1">${review.usuarioNombre}</h6>
                        <div class="mb-2">
                            ${generateStars(review.calificacion)}
                            <span class="badge ${review.recomendado ? 'bg-success' : 'bg-danger'} ms-2">
                                ${review.recomendado ? '👍 Recomendado' : '👎 No recomendado'}
                            </span>
                            <span class="badge bg-primary ms-2">Mi reseña</span>
                            ${review.usuarioVerificado ? '<span class="badge bg-info ms-2"><i class="fas fa-check-circle me-1"></i>Usuario verificado</span>' : ''}
                        </div>
                    </div>
                    <small class="text-muted">${review.fecha}</small>
                </div>
                <p class="card-text">${review.comentario}</p>
                <div class="mt-2">
                    <small class="text-muted">Enviado el: ${review.timestamp?.toDate ? review.timestamp.toDate().toLocaleString() : new Date(review.timestamp).toLocaleString()}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function loadExistingReviews() {
    console.log('📥 Cargando reseñas existentes desde Firestore...');
    
    const q = query(reviewsCollection, orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        allReviews = [];
        snapshot.forEach((doc) => {
            allReviews.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ ${allReviews.length} reseñas cargadas desde Firestore`);
        
        renderReviews(allReviews);
        updateStats(allReviews);
        updateAverageStars(allReviews);
    }, (error) => {
        console.error('❌ Error cargando reseñas:', error);
    });
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container) {
        console.error('❌ No se encuentra el contenedor de reseñas');
        return;
    }

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay reseñas para mostrar</p>
                <small class="text-muted">¡Sé el primero en escribir una reseña!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="card review-card mb-3">
            <div class="card-body">
                <div class="review-header">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${review.usuarioNombre || 'Cliente AquaQuality'}</h6>
                            <div class="mb-2">
                                ${generateStars(review.calificacion)}
                                <span class="badge ${review.recomendado ? 'bg-success' : 'bg-danger'} ms-2">
                                    ${review.recomendado ? '👍 Recomendado' : '👎 No recomendado'}
                                </span>
                                ${review.usuarioVerificado ? '<span class="badge bg-info ms-2"><i class="fas fa-check-circle me-1"></i>Usuario verificado</span>' : ''}
                                ${review.usuarioId ? '<span class="badge bg-secondary ms-2"><i class="fas fa-user me-1"></i>Usuario registrado</span>' : ''}
                            </div>
                        </div>
                        <small class="text-muted">${review.fecha || 'Fecha no disponible'}</small>
                    </div>
                </div>
                <p class="card-text">${review.comentario}</p>
                <div class="review-footer mt-2">
                    <small class="text-muted">
                        ${review.timestamp?.toDate ? 
                            `Enviado el: ${review.timestamp.toDate().toLocaleString()}` : 
                            `Enviado: ${new Date(review.timestamp).toLocaleString()}`
                        }
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.btn-group .btn[data-rating]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            filterReviewsByRating(rating);
        });
    });
}

function filterReviewsByRating(rating) {
    let filteredReviews = allReviews;
    
    if (rating > 0) {
        filteredReviews = allReviews.filter(review => review.calificacion === rating);
    }
    
    renderReviews(filteredReviews);
}

function generateStars(calificacion) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            stars += '<i class="fas fa-star text-warning me-1"></i>';
        } else {
            stars += '<i class="far fa-star text-warning me-1"></i>';
        }
    }
    return stars;
}

function updateStats(reviews) {
    const total = reviews.length;
    const totalEl = document.getElementById('total-reviews');
    const averageEl = document.querySelector('.average-rating');
    
    if (totalEl) totalEl.textContent = total;
    
    if (total === 0) {
        if (averageEl) averageEl.textContent = '0.0';
        resetProgressBars();
        return;
    }

    const suma = reviews.reduce((sum, review) => {
        const calificacion = Number(review.calificacion) || 0;
        return sum + calificacion;
    }, 0);
    
    const promedio = suma / total;
    
    if (averageEl) averageEl.textContent = promedio.toFixed(1);

    const distribucion = {5:0, 4:0, 3:0, 2:0, 1:0};
    reviews.forEach(review => {
        const calificacion = Number(review.calificacion) || 0;
        if (calificacion >= 1 && calificacion <= 5) {
            distribucion[calificacion]++;
        }
    });

    for (let i = 1; i <= 5; i++) {
        const porcentaje = (distribucion[i] / total) * 100;
        const bar = document.getElementById(`rating-${i}-bar`);
        const count = document.getElementById(`rating-${i}-count`);
        
        if (bar) bar.style.width = `${porcentaje}%`;
        if (count) count.textContent = distribucion[i];
    }
    
    console.log(`📊 Estadísticas: ${total} reseñas, promedio: ${promedio.toFixed(1)}`);
}

function updateAverageStars(reviews) {
    const averageStars = document.getElementById('average-stars');
    if (!averageStars || reviews.length === 0) return;

    const promedio = reviews.reduce((sum, review) => {
        const calificacion = Number(review.calificacion) || 0;
        return sum + calificacion;
    }, 0) / reviews.length;
    
    const promedioRedondeado = Math.round(promedio);
    
    averageStars.innerHTML = generateStars(promedioRedondeado);
}

function resetProgressBars() {
    for (let i = 1; i <= 5; i++) {
        const bar = document.getElementById(`rating-${i}-bar`);
        const count = document.getElementById(`rating-${i}-count`);
        
        if (bar) bar.style.width = '0%';
        if (count) count.textContent = '0';
    }
}

// DEBUG: Verificar que todo esté cargado
console.log('✅ reseñas.js con Firestore cargado correctamente');
console.log('🔍 Firestore db:', db ? 'INICIALIZADO' : 'NO INICIALIZADO');
console.log('🔍 reviewsCollection:', reviewsCollection);