/* Sofia Valentina - Premium Profile Website
   Integrates Firebase Auth, Storage, and PayPal payments
   Modern vanilla JavaScript with ES6+ features
*/

// Import Firebase from our config file
import { 
  auth, 
  db, 
  storage, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged,
  handleAuthDomain 
} from './firebase-config.js';

// Firebase Storage imports for media handling
import { 
  ref, 
  listAll, 
  getDownloadURL,
  getMetadata 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Global state management
const AppState = {
  currentUser: null,
  photos: [],
  videos: [],
  currentFilter: 'all',
  photosLoaded: 0,
  videosLoaded: 0,
  photosPerPage: 12,
  videosPerPage: 8
};

// DOM Elements cache
const Elements = {
  // Profile elements
  profilePicture: null,
  profileName: null,
  photoCount: null,
  videoCount: null,
  subscriberCount: null,
  
  // Buttons
  subscribeBtn: null,
  loginBtn: null,
  
  // Grids
  photoGrid: null,
  videoGrid: null,
  
  // Modals
  authModal: null,
  paymentModal: null,
  mediaModal: null,
  ageGate: null,
  
  // Filter buttons
  photoFilters: null,
  videoFilters: null
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
  try {
    console.log('Initializing Sofia Valentina Profile...');
    
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Firebase Auth
    setupFirebaseAuth();
    
    // Check age gate
    checkAgeGate();
    
    // Load initial content
    await loadInitialContent();
    
    console.log('App initialized successfully');
    
  } catch (error) {
    console.error('Error initializing app:', error);
    showError('Error al inicializar la aplicación. Por favor recarga la página.');
  }
}

function cacheElements() {
  // Profile elements
  Elements.profilePicture = document.getElementById('profilePicture');
  Elements.profileName = document.getElementById('profileName');
  Elements.photoCount = document.getElementById('photoCount');
  Elements.videoCount = document.getElementById('videoCount');
  Elements.subscriberCount = document.getElementById('subscriberCount');
  
  // Buttons
  Elements.subscribeBtn = document.getElementById('subscribeBtn');
  Elements.loginBtn = document.getElementById('loginBtn');
  Elements.headerLoginBtn = document.getElementById('headerLoginBtn');
  Elements.headerSubscribeBtn = document.getElementById('headerSubscribeBtn');
  
  // Grids
  Elements.photoGrid = document.getElementById('photoGrid');
  Elements.videoGrid = document.getElementById('videoGrid');
  
  // Modals
  Elements.authModal = document.getElementById('authModal');
  Elements.paymentModal = document.getElementById('paymentModal');
  Elements.mediaModal = document.getElementById('mediaModal');
  Elements.ageGate = document.getElementById('ageGate');
  
  // Filter buttons
  Elements.photoFilters = document.querySelectorAll('#photos .filter-btn');
  Elements.videoFilters = document.querySelectorAll('#videos .filter-btn');
}

function setupEventListeners() {
  // Profile action buttons
  if (Elements.subscribeBtn) {
    Elements.subscribeBtn.addEventListener('click', () => openSubscriptionModal());
  }
  
  if (Elements.loginBtn) {
    Elements.loginBtn.addEventListener('click', () => openAuthModal());
  }
  
  if (Elements.headerLoginBtn) {
    Elements.headerLoginBtn.addEventListener('click', () => openAuthModal());
  }
  
  if (Elements.headerSubscribeBtn) {
    Elements.headerSubscribeBtn.addEventListener('click', () => openSubscriptionModal());
  }
  
  // Plan buttons
  document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', (e) => handlePlanSelection(e));
  });
  
  // Auth modal events
  document.getElementById('googleSignInBtn')?.addEventListener('click', handleGoogleSignIn);
  document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);
  document.getElementById('closeAuth')?.addEventListener('click', () => closeModal('authModal'));
  
  // Payment modal events
  document.getElementById('closePayment')?.addEventListener('click', () => closeModal('paymentModal'));
  
  // Media modal events
  document.getElementById('closeMedia')?.addEventListener('click', () => closeModal('mediaModal'));
  
  // Filter buttons
  Elements.photoFilters?.forEach(btn => {
    btn.addEventListener('click', (e) => handlePhotoFilter(e));
  });
  
  Elements.videoFilters?.forEach(btn => {
    btn.addEventListener('click', (e) => handleVideoFilter(e));
  });
  
  // Load more buttons
  document.getElementById('loadMorePhotos')?.addEventListener('click', loadMorePhotos);
  document.getElementById('loadMoreVideos')?.addEventListener('click', loadMoreVideos);
  
  // Age gate buttons
  document.getElementById('confirmAge')?.addEventListener('click', confirmAge);
  document.getElementById('leaveSite')?.addEventListener('click', leaveSite);
  
  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
  
  // Close modals when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });
}

function setupFirebaseAuth() {
  // Listen for authentication state changes
  onAuthStateChanged(auth, (user) => {
    AppState.currentUser = user;
    updateUIForAuthState(user);
  });
}

function updateUIForAuthState(user) {
  const userInfo = document.getElementById('userInfo');
  const authButtons = document.querySelector('.auth-buttons');
  
  if (user) {
    // User is signed in
    Elements.loginBtn.innerHTML = `<span>👤</span> ${user.displayName || 'Mi Perfil'}`;
    Elements.loginBtn.classList.remove('ghost');
    Elements.loginBtn.classList.add('secondary');
    
    // Update modal UI
    if (userInfo && authButtons) {
      userInfo.style.display = 'block';
      authButtons.style.display = 'none';
      
      document.getElementById('userName').textContent = user.displayName || 'Usuario';
      document.getElementById('userEmail').textContent = user.email;
      if (user.photoURL) {
        document.getElementById('userPhoto').src = user.photoURL;
      }
    }
    
    console.log('User signed in:', user.displayName);
  } else {
    // User is signed out
    Elements.loginBtn.innerHTML = `<span>🔐</span> Iniciar Sesión`;
    Elements.loginBtn.classList.remove('secondary');
    Elements.loginBtn.classList.add('ghost');
    
    // Update modal UI
    if (userInfo && authButtons) {
      userInfo.style.display = 'none';
      authButtons.style.display = 'block';
    }
    
    console.log('User signed out');
  }
}

async function handleGoogleSignIn() {
  try {
    showLoading('Iniciando sesión...');
    const result = await signInWithGoogle();
    hideLoading();
    closeModal('authModal');
    showSuccess('¡Bienvenido! Has iniciado sesión correctamente.');
  } catch (error) {
    hideLoading();
    console.error('Sign in error:', error);
    
    const domainError = handleAuthDomain(error);
    if (domainError.isError) {
      showAuthError(domainError.message);
    } else {
      showAuthError('Error al iniciar sesión. Por favor intenta de nuevo.');
    }
  }
}

async function handleSignOut() {
  try {
    await signOutUser();
    closeModal('authModal');
    showSuccess('Has cerrado sesión correctamente.');
  } catch (error) {
    console.error('Sign out error:', error);
    showError('Error al cerrar sesión.');
  }
}

async function loadInitialContent() {
  showLoading('Cargando contenido...');
  
  try {
    // Load photos and videos from Firebase Storage
    await Promise.all([
      loadPhotosFromStorage(),
      loadVideosFromStorage()
    ]);
    
    // Update counters
    updateContentCounters();
    
  } catch (error) {
    console.error('Error loading content:', error);
    showError('Error al cargar el contenido. Por favor recarga la página.');
  } finally {
    hideLoading();
  }
}

async function loadPhotosFromStorage() {
  try {
    // Create mock photos for demo (in production, load from Firebase Storage)
    const mockPhotos = Array.from({length: 24}, (_, i) => ({
      id: `photo_${i + 1}`,
      url: `https://picsum.photos/seed/sofia${i + 1}/400/400`,
      title: `Foto Profesional ${i + 1}`,
      description: `Sesión fotográfica profesional #${i + 1}`,
      category: ['professional', 'casual', 'exclusive'][i % 3],
      isPremium: i % 4 === 0,
      timestamp: Date.now() - (i * 86400000) // Days ago
    }));
    
    AppState.photos = mockPhotos;
    renderPhotos();
    
  } catch (error) {
    console.error('Error loading photos:', error);
  }
}

async function loadVideosFromStorage() {
  try {
    // Create mock videos for demo (in production, load from Firebase Storage)
    const mockVideos = Array.from({length: 16}, (_, i) => ({
      id: `video_${i + 1}`,
      thumbnail: `https://picsum.photos/seed/video${i + 1}/640/360`,
      title: `Video Exclusivo ${i + 1}`,
      description: `Contenido en video premium #${i + 1}`,
      duration: ['2:34', '5:12', '8:45', '12:20'][i % 4],
      category: ['short', 'long', 'premium'][i % 3],
      isPremium: i % 3 === 0,
      timestamp: Date.now() - (i * 86400000)
    }));
    
    AppState.videos = mockVideos;
    renderVideos();
    
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

function renderPhotos() {
  if (!Elements.photoGrid) return;
  
  const filteredPhotos = filterContent(AppState.photos, AppState.currentFilter);
  const photosToShow = filteredPhotos.slice(0, AppState.photosLoaded + AppState.photosPerPage);
  
  Elements.photoGrid.innerHTML = '';
  
  photosToShow.forEach((photo, index) => {
    const photoElement = createPhotoElement(photo, index);
    Elements.photoGrid.appendChild(photoElement);
  });
  
  AppState.photosLoaded = photosToShow.length;
  
  // Update load more button visibility
  const loadMoreBtn = document.getElementById('loadMorePhotos');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = photosToShow.length < filteredPhotos.length ? 'block' : 'none';
  }
}

function createPhotoElement(photo, index) {
  const div = document.createElement('div');
  div.className = `photo-item ${photo.isPremium ? 'photo-premium' : ''}`;
  div.style.animationDelay = `${index * 0.1}s`;
  
  div.innerHTML = `
    <img src="${photo.url}" alt="${photo.title}" loading="lazy">
    <div class="photo-overlay">
      <span>${photo.isPremium ? '👑' : '📷'}</span>
    </div>
  `;
  
  div.addEventListener('click', () => openMediaModal(photo, 'photo'));
  
  return div;
}

function renderVideos() {
  if (!Elements.videoGrid) return;
  
  const filteredVideos = filterContent(AppState.videos, AppState.currentFilter);
  const videosToShow = filteredVideos.slice(0, AppState.videosLoaded + AppState.videosPerPage);
  
  Elements.videoGrid.innerHTML = '';
  
  videosToShow.forEach((video, index) => {
    const videoElement = createVideoElement(video, index);
    Elements.videoGrid.appendChild(videoElement);
  });
  
  AppState.videosLoaded = videosToShow.length;
  
  // Update load more button visibility
  const loadMoreBtn = document.getElementById('loadMoreVideos');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = videosToShow.length < filteredVideos.length ? 'block' : 'none';
  }
}

function createVideoElement(video, index) {
  const div = document.createElement('div');
  div.className = 'video-item';
  div.style.animationDelay = `${index * 0.1}s`;
  
  div.innerHTML = `
    <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy">
    <div class="video-play-btn">▶</div>
    <div class="video-duration">${video.duration}</div>
  `;
  
  div.addEventListener('click', () => openMediaModal(video, 'video'));
  
  return div;
}

function filterContent(content, filter) {
  if (filter === 'all') return content;
  return content.filter(item => item.category === filter);
}

function handlePhotoFilter(e) {
  const filter = e.target.dataset.filter;
  AppState.currentFilter = filter;
  AppState.photosLoaded = 0;
  
  // Update active filter button
  Elements.photoFilters.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  renderPhotos();
}

function handleVideoFilter(e) {
  const filter = e.target.dataset.filter;
  AppState.currentFilter = filter;
  AppState.videosLoaded = 0;
  
  // Update active filter button
  Elements.videoFilters.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  renderVideos();
}

function loadMorePhotos() {
  renderPhotos();
}

function loadMoreVideos() {
  renderVideos();
}

function updateContentCounters() {
  if (Elements.photoCount) {
    Elements.photoCount.textContent = AppState.photos.length;
  }
  if (Elements.videoCount) {
    Elements.videoCount.textContent = AppState.videos.length;
  }
}

function openAuthModal() {
  openModal('authModal');
}

function openSubscriptionModal() {
  // Show the plans section
  document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
}

function openMediaModal(media, type) {
  const mediaContent = document.getElementById('mediaContent');
  const mediaTitle = document.getElementById('mediaTitle');
  const mediaDescription = document.getElementById('mediaDescription');
  
  if (type === 'photo') {
    mediaContent.innerHTML = `<img src="${media.url}" alt="${media.title}">`;
  } else {
    // For demo purposes, show thumbnail with play overlay
    mediaContent.innerHTML = `
      <div style="position: relative;">
        <img src="${media.thumbnail}" alt="${media.title}">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(255, 45, 95, 0.9); border-radius: 50%; width: 80px; height: 80px;
                    display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">
          ▶
        </div>
      </div>
    `;
  }
  
  mediaTitle.textContent = media.title;
  mediaDescription.textContent = media.description;
  
  openModal('mediaModal');
}

function handlePlanSelection(e) {
  const plan = e.target.dataset.plan;
  const price = e.target.dataset.price;
  
  // Check if user is authenticated
  if (!AppState.currentUser) {
    showError('Debes iniciar sesión antes de suscribirte.');
    openAuthModal();
    return;
  }
  
  openPaymentModal(plan, price);
}

function openPaymentModal(plan, price) {
  const planName = document.getElementById('planName');
  const planPrice = document.getElementById('planPrice');
  
  const planNames = {
    basic: 'Plan Básico',
    premium: 'Plan Premium', 
    vip: 'Plan VIP'
  };
  
  planName.textContent = planNames[plan] || plan;
  planPrice.textContent = `$${price}/mes`;
  
  // Initialize PayPal button (simplified for demo)
  initializePayPalButton(plan, price);
  
  openModal('paymentModal');
}

function initializePayPalButton(plan, price) {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Check if PayPal SDK is loaded
  if (typeof paypal !== 'undefined') {
    // Use actual PayPal SDK with real implementation
    paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal'
      },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: price,
              currency_code: 'USD'
            },
            description: `Suscripción ${plan} - Sofia Valentina Premium`,
            custom_id: `sub_${plan}_${Date.now()}`
          }],
          application_context: {
            brand_name: 'Private & Pro - Sofia Valentina',
            locale: 'es_ES',
            user_action: 'PAY_NOW',
            return_url: window.location.origin + '/success',
            cancel_url: window.location.origin + '/cancel'
          }
        });
      },
      onApprove: function(data, actions) {
        showLoading('Procesando pago con PayPal...');
        return actions.order.capture().then(function(details) {
          processSuccessfulPayment(plan, price, details);
        }).catch(function(error) {
          hideLoading();
          console.error('Payment capture error:', error);
          showError('Error al capturar el pago. Por favor contacta soporte.');
        });
      },
      onCancel: function(data) {
        console.log('Payment cancelled:', data);
        showError('Pago cancelado. Puedes intentarlo de nuevo cuando gustes.');
      },
      onError: function(err) {
        console.error('PayPal Error:', err);
        showError('Error al procesar el pago. Por favor verifica tu conexión e intenta de nuevo.');
      }
    }).render('#paypal-button-container').catch(function(error) {
      console.error('PayPal render error:', error);
      // Fallback for render errors
      showPayPalFallback(plan, price);
    });
  } else {
    console.warn('PayPal SDK not loaded, showing fallback');
    showPayPalFallback(plan, price);
  }
}

function showPayPalFallback(plan, price) {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align: center; padding: 20px; border: 2px dashed var(--text-muted); border-radius: var(--radius);">
      <p style="color: var(--text-muted); margin-bottom: 16px;">
        ⚠️ Error al cargar PayPal. Por favor recarga la página o contacta soporte.
      </p>
      <button class="btn secondary" onclick="location.reload()">
        🔄 Recargar Página
      </button>
    </div>
  `;
}

function simulatePayPalPayment(plan, price) {
  showLoading('Procesando pago...');
  
  // Simulate payment processing
  setTimeout(() => {
    processSuccessfulPayment(plan, price, { demo: true });
  }, 2000);
}

function processSuccessfulPayment(plan, price, details) {
  hideLoading();
  closeModal('paymentModal');
  showSuccess(`¡Pago exitoso! Te has suscrito al ${plan} por $${price}/mes.`);
  
  // Update UI to show subscription status
  updateSubscriptionStatus(plan);
  
  // In a real application, you would send this to your backend
  console.log('Payment processed:', { plan, price, details });
}

function updateSubscriptionStatus(plan) {
  // Update user interface to reflect subscription
  Elements.subscribeBtn.innerHTML = `<span>✅</span> Suscrito - ${plan}`;
  Elements.subscribeBtn.classList.remove('primary');
  Elements.subscribeBtn.classList.add('secondary');
}

// Age gate functions
function checkAgeGate() {
  if (sessionStorage.getItem('isAdult') === 'true') {
    Elements.ageGate?.setAttribute('aria-hidden', 'true');
  } else {
    // Show age gate if not confirmed
    Elements.ageGate?.setAttribute('aria-hidden', 'false');
  }
}

function confirmAge() {
  sessionStorage.setItem('isAdult', 'true');
  Elements.ageGate?.setAttribute('aria-hidden', 'true');
}

function leaveSite() {
  window.location.href = 'about:blank';
}

// Modal management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
}

// Utility functions
function showLoading(message = 'Cargando...') {
  // Create or update loading indicator
  let loader = document.getElementById('loading-indicator');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(18, 20, 32, 0.95);
      color: white;
      padding: 20px 30px;
      border-radius: 16px;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    document.body.appendChild(loader);
  }
  loader.textContent = message;
  loader.style.display = 'block';
}

function hideLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'none';
  }
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showAuthError(message) {
  const errorDiv = document.getElementById('authError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 16px;
    color: white;
    z-index: 1000;
    max-width: 400px;
    backdrop-filter: blur(10px);
    animation: slideIn 0.3s ease-out;
  `;
  
  if (type === 'success') {
    notification.style.background = 'rgba(0, 255, 136, 0.9)';
    notification.innerHTML = `<span>✅</span> ${message}`;
  } else if (type === 'error') {
    notification.style.background = 'rgba(255, 45, 95, 0.9)';
    notification.innerHTML = `<span>❌</span> ${message}`;
  } else {
    notification.style.background = 'rgba(18, 20, 32, 0.9)';
    notification.innerHTML = `<span>ℹ️</span> ${message}`;
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .photo-item, .video-item {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

console.log('Sofia Valentina Profile Script Loaded ✨');