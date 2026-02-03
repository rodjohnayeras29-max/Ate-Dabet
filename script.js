const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

const modalOverlay = $('#modal-overlay');
const closeModalBtn = $('#modal-close');
const productWrappers = $$('.product-image');
const modalImage = $('.product-desc-modal .modal-main-image img');
const modalSmallImages = $$('.product-desc-modal .modal-image-small img');
const modalName = $('#modal-name');
const modalDesc = $('#modal-desc');
const modalPrice = $('#modal-price');
const modalAddToCartBtn = $('#add-to-cart');
const buyNowBtn = $('#buy-now');

// Modal open/close helpers
const setModalOpen = (open) => {
  if (!modalOverlay) return;
  modalOverlay.classList.toggle('open', !!open);
  modalOverlay.style.visibility = open ? 'visible' : 'hidden';
  modalOverlay.style.opacity = open ? '1' : '0';
};

function openModal(product = {}) {
  if (!modalOverlay) return;
  if (modalImage) modalImage.src = product.imageSrc || '';
  if (modalName) modalName.textContent = product.name || '';
  if (modalDesc) modalDesc.textContent = product.description || '';
  if (modalPrice) modalPrice.textContent = product.price || '';

  if (modalSmallImages.length) {
    modalSmallImages.forEach((sImg, i) => {
      const src = (product.images && product.images[i]) || product.images?.[0] || product.imageSrc || sImg.src;
      sImg.src = src;
      sImg.style.display = src ? 'block' : 'none';
    });
  }

  setModalOpen(true);
}

const closeModal = () => setModalOpen(false);

productWrappers.forEach((wrapper) => {
  const img = wrapper.querySelector('img');
  if (!img) return;
  wrapper.addEventListener('click', () => {
    const imagesAttr = img.getAttribute('data-images');
    const images = imagesAttr ? imagesAttr.split(',').map(s => s.trim()).filter(Boolean) : [img.src];
    openModal({
      imageSrc: img.src,
      images,
      name: img.getAttribute('data-name') || '',
      description: img.getAttribute('data-description') || '',
      price: img.getAttribute('data-price') || ''
    });
  });
});

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) closeModal(); });

// Cart counter (nav)
const cartCounterEl = document.querySelector('.cart-counter');

// Cart storage helpers
const CART_KEY = 'cartItems';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = (items) => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartDisplay(); };
const updateCartDisplay = () => {
  const total = getCart().reduce((s, i) => s + (Number(i.qty) || 0), 0);
  if (cartCounterEl) cartCounterEl.textContent = total;
};

// Add product to cart (merge by name+image)
const addProductToCart = (product) => {
  if (!product) return;
  const items = getCart();
  const key = (product.name || '') + '|' + (product.image || '');
  const idx = items.findIndex(i => ((i.name||'') + '|' + (i.image||'')) === key);
  const qty = Math.max(1, Number(product.qty) || 1);
  if (idx > -1) {
    items[idx].qty = (Number(items[idx].qty) || 0) + qty;
  } else {
    items.push({
      image: product.image || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      qty
    });
  }
  saveCart(items);
  alert(`${product.name || 'Item'} added to cart!`);
};

// expose for other pages (cart page) to use
window.addProductToCart = addProductToCart;

// Product list 'Add to Cart' buttons (increment by 1)
document.querySelectorAll('.add-to-cart').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent opening modal when clicking the product card's button
    const productEl = btn.closest('.products');
    const imgEl = productEl?.querySelector('.product-image img');
    const name = productEl?.querySelector('.product-name')?.textContent?.trim() || 'Item';
    const price = productEl?.querySelector('.price')?.textContent?.trim() || imgEl?.getAttribute('data-price') || '';
    const desc = imgEl?.getAttribute('data-description') || '';
    addProductToCart({ image: imgEl?.src || '', name, description: desc, price, qty: 1 });
  });
});

// Modal Add to Cart uses quantity if present
let currentModalProduct = null;
function openModal(product = {}) {
  currentModalProduct = product;
  if (!modalOverlay) return;
  if (modalImage) modalImage.src = product.imageSrc || '';
  if (modalName) modalName.textContent = product.name || '';
  if (modalDesc) modalDesc.textContent = product.description || '';
  if (modalPrice) modalPrice.textContent = product.price || '';

  if (modalSmallImages.length) {
    modalSmallImages.forEach((sImg, i) => {
      const src = (product.images && product.images[i]) || product.images?.[0] || product.imageSrc || sImg.src;
      sImg.src = src;
      sImg.style.display = src ? 'block' : 'none';
    });
  }

  setModalOpen(true);
}

if (modalAddToCartBtn) modalAddToCartBtn.addEventListener('click', () => {
  const qtyInput = document.getElementById('modal-quantity');
  const qty = Math.max(1, Number(qtyInput?.value) || 1);
  if (!currentModalProduct) return;
  addProductToCart({ image: currentModalProduct.imageSrc || currentModalProduct.image || '', name: currentModalProduct.name || modalName?.textContent || '', description: currentModalProduct.description || modalDesc?.textContent || '', price: currentModalProduct.price || modalPrice?.textContent || '', qty });
  closeModal();
});

if (buyNowBtn) buyNowBtn.addEventListener('click', () => alert(`Proceeding to buy ${modalName?.textContent}!`));

modalSmallImages.forEach((s) => s.addEventListener('click', () => { if (modalImage) modalImage.src = s.src; }));

// initialize cart counter display
updateCartDisplay();


// PAGINATION FOR CATEGORIES
const categoriesData = [ 
    {name: "Electrical Supplies", img: "images/electrical-cat-bg.png", href: "products.html#electrical" },
    {name: "Door Hardware & Security", img: "images/door-security-cat-bg.png", href: "products.html#door-hardware"},
    {name: "Paints and Coatings", img: "images/paints-coatings-cat-bg.png", href: "products.html#paints-coating"},
    {name: "Painting Tools", img: "images/paint-tools-cat-bg.png", href: "products.html#paint-tools"},
    {name: "Chemicals and Adhesive", img: "images/chemicals-adhesive-cat-bg.png", href: "products.html#chemicals-adhesive"},
    {name: "PVC & Electrical Conduits", img: "images/pvc-cat-bg.png", href: "products.html#pvc-conduits"},
    {name: "Abrasives", img: "images/abrasive-cat-bg.png", href: "products.html#abrasives"}
  
]

const itemsPerPage = 5;
let currentIndex = 0;

const container = document.getElementById('categories-container');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

function renderCategories() {
  if (!container) return;
  container.innerHTML = "";

  const visibleItems = categoriesData.slice(currentIndex, currentIndex + itemsPerPage);

  visibleItems.forEach(category => {
    container.innerHTML += `
    <a
      href="${category.href}"
      id="${category.id}"
      class="category-item"

        <div class= "category-item">
          <div class="category-image">
            <img src = ${category.img} alt="${category.name}">
          </div>
          <h3>${category.name}</h3>
        </div>
    </a>
    `;
  });
}

if (container) {
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex -= itemsPerPage;
        renderCategories();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentIndex + itemsPerPage < categoriesData.length) {
        currentIndex += itemsPerPage;
        renderCategories();
      }
    });
  }

  renderCategories();
}

// NAV TOGGLE (hamburger for small screens)
(function(){
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('.nav-side-bar');
  const overlay = document.getElementById('nav-overlay');
  if (!navToggle || !nav || !overlay) return;

  const setNavOpen = (open) => {
    nav.classList.toggle('open', !!open);
    overlay.classList.toggle('active', !!open);
    navToggle.setAttribute('aria-expanded', !!open ? 'true' : 'false');
    overlay.setAttribute('aria-hidden', !!open ? 'false' : 'true');
    document.body.style.overflow = !!open ? 'hidden' : '';
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setNavOpen(!nav.classList.contains('open'));
  });

  overlay.addEventListener('click', () => setNavOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setNavOpen(false);
  });
})();
