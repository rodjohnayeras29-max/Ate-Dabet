// cart.js - renders cart items from localStorage and allows qty updates / removal
(function(){
  const CART_KEY = 'cartItems';
  const $ = (sel) => document.querySelector(sel);
  const cartItemsEl = $('#cart-items');
  const cartEmptyEl = $('#cart-empty');
  const cartHeadersEl = document.querySelector('.cart-headers');
  const cartTotalEl = $('#cart-total');

  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const saveCart = (items) => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateNavCounter(); };

  function parsePrice(p) {
    if (!p && p !== 0) return 0;
    try { return parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0; } catch(e){return 0}
  }

  function updateNavCounter(){
    const counter = document.querySelector('.cart-counter');
    if (!counter) return;
    const total = getCart().reduce((s,i)=>s + (Number(i.qty)||0),0);
    counter.textContent = total;
  }

  function render() {
    const items = getCart();
    cartItemsEl.innerHTML = '';
    if (!items.length) {
      cartEmptyEl.style.display = 'block';
      if (cartHeadersEl) cartHeadersEl.style.display = 'none';
      cartTotalEl.textContent = 'Total: ₱ 0.00';
      return;
    }
    cartEmptyEl.style.display = 'none';
    if (cartHeadersEl) cartHeadersEl.style.display = 'flex';

    let total = 0;
    items.forEach((it, idx) => {
      const priceNum = parsePrice(it.price);
      const subtotal = priceNum * (Number(it.qty)||1);
      total += subtotal;

      const itemWrap = document.createElement('div');
      itemWrap.className = 'cart-item';
      itemWrap.style.display = 'flex';
      itemWrap.style.gap = '12px';
      itemWrap.style.alignItems = 'center';
      itemWrap.style.padding = '10px 0';
      itemWrap.innerHTML = `
        <img src="${it.image}" alt="${it.name}" style="width:auto;height:100px;object-fit:cover;background:#ededed;padding:4px;border:none;border-radius:5px">

            <div style="flex:1">
            <div style="font-weight:600;color:#222">${it.name}</div>
            <div style="font-size:0.9em;color:#555">${it.description || ''}</div>
            </div>

            <div style="display:flex;gap:20px;background:#f9f9f9;">
                <div style="width:120px;text-align:center; align-items:center; justify-content:center;">
                    <p style="font-weight:bold; margin-bottom:10px;"> PRICE:</p>
                    ${it.price}
                </div>

                <div style="width:120px;text-align:center">
                    <p style="font-weight:bold; margin-bottom:10px;"> QUANTITY:</p>
                    <input data-idx="${idx}" type="number" min="1" value="${it.qty}" style="width:60px;text-align:center;padding:4px;border:1px solid #ccc;border-radius:4px;outline:none;">
                </div>
                
                <div style= "display:flex; flex-direction:column; justify-content:center; align-items:center;background:">

                    <p style="font-weight:bold;margin;margin-bottom:10px;"> TOTAL:</p>
                    <div style="margin-bottom:10px;" >₱ ${subtotal.toFixed(2)}</div>
                    <button data-remove="${idx}" style=" font-size:17px; padding:5px; border:none; border-radius:20px; outline:none; background: #ce5353; color:#222; cursor:pointer; "><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>   
      `;

      cartItemsEl.appendChild(itemWrap);
    });

    cartTotalEl.textContent = `Total: ₱ ${total.toFixed(2)}`;

    // attach listeners
    cartItemsEl.querySelectorAll('input[type="number"]').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        const val = Math.max(1, Number(e.target.value) || 1);
        const items = getCart();
        if (!items[idx]) return;
        items[idx].qty = val;
        saveCart(items);
        render();
      });
    });

    cartItemsEl.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // use the currentTarget (the button the listener was attached to)
        const idxAttr = e.currentTarget?.getAttribute('data-remove') || btn.getAttribute('data-remove');
        const idx = Number(idxAttr);
        const items = getCart();
        if (Number.isNaN(idx) || !items[idx]) return;
        items.splice(idx,1);
        saveCart(items);
        render();
      });
    });

    updateNavCounter();
  }

  // actions
  $('#clear-cart')?.addEventListener('click', () => { localStorage.removeItem(CART_KEY); render(); });
  $('#checkout')?.addEventListener('click', () => { alert('Proceeding to checkout'); });

  // initial render
  render();
})();
