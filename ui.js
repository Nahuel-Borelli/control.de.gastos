// ui.js
import { state } from './store.js';

// --- Funciones de Utilidad ---
export function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function showHistorialSkeleton(listaGastosEl) {
  listaGastosEl.innerHTML = `
    <li><div class="skeleton skeleton-text" style="width: 90%;"></div></li>
    <li><div class="skeleton skeleton-text" style="width: 80%;"></div></li>
    <li><div class="skeleton skeleton-text" style="width: 85%;"></div></li>
    <li><div class="skeleton skeleton-text" style="width: 95%;"></div></li>
  `;
}

export function showKpiSkeleton(tablaCategoriasEl) {
  tablaCategoriasEl.innerHTML = `
    <li><div class="skeleton skeleton-text" style="width: 100%;"></div></li>
    <li><div class="skeleton skeleton-text" style="width: 100%;"></div></li>
    <li><div class="skeleton skeleton-text" style="width: 100%;"></div></li>
  `;
}

// --- Funciones de Renderizado ---
export function renderMonedas(monedaEl) {
  const lastUsed = localStorage.getItem('lastUsedCurrency');
  state.monedas.sort((a, b) => {
    if (a === lastUsed) return -1; if (b === lastUsed) return 1;
    if (a === 'ARS') return -1; if (b === 'ARS') return 1;
    if (a === 'USD') return -1; if (b === 'USD') return 1;
    return a.localeCompare(b);
  });
  monedaEl.innerHTML = '';
  state.monedas.forEach(m => {
    const option = document.createElement('option');
    option.value = m;
    option.textContent = m;
    monedaEl.appendChild(option);
  });
  if (lastUsed) monedaEl.value = lastUsed;
}

export function renderCategorias(categoriaEl, listaCategoriasGestionEl) {
  categoriaEl.innerHTML = '<option value="">Categoría</option>';
  listaCategoriasGestionEl.innerHTML = '';
  state.categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.nombre;
    categoriaEl.appendChild(option);
    const li = document.createElement('li');
    li.dataset.id = cat.id;
    li.innerHTML = `<span>${cat.nombre}</span><div class="actions"><button class="edit">✏️</button><button class="delete">❌</button></div>`;
    listaCategoriasGestionEl.appendChild(li);
  });
}

export function renderHistorial(listaGastosEl) {
  listaGastosEl.innerHTML = '';
  if (state.gastos.length === 0) {
    listaGastosEl.innerHTML = '<li>No hay gastos en este período.</li>';
    return;
  }
  state.gastos.forEach(gasto => {
    const li = document.createElement('li');
    li.dataset.id = gasto.id_local || gasto.id;
    const categoria = state.categorias.find(c => c.id == gasto.categoria_id)?.nombre || 'Sin Categoría';
    const pendingIcon = gasto.pending ? '<span>🕓</span>' : '';
    li.innerHTML = `<span>${new Date(gasto.fecha + 'T00:00:00-03:00').toLocaleDateString('es-AR')} - ${categoria} - ${gasto.monto_original.toFixed(2)} ${gasto.moneda} ${gasto.monto_usd ? `(USD ${gasto.monto_usd.toFixed(2)})` : ''} ${pendingIcon}</span><div><button class="edit">✏️</button><button class="delete">❌</button></div>`;
    listaGastosEl.appendChild(li);
  });
}

export function renderKPIs(totalPeriodoEl, tablaCategoriasEl) {
  totalPeriodoEl.textContent = state.kpis.total_usd.toFixed(2);
  tablaCategoriasEl.innerHTML = '';

  if (state.kpis.gastos_por_categoria.length === 0) {
    tablaCategoriasEl.innerHTML = '<li>No hay datos para mostrar.</li>';
    return;
  }
  state.kpis.gastos_por_categoria.forEach(cat => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${cat.categoria_nombre}</span><strong>USD ${cat.total_usd.toFixed(2)}</strong>`;
    tablaCategoriasEl.appendChild(li);
  });
}

// --- Funciones de Modal ---
export function abrirModalCategorias(modalCategorias) {
  modalCategorias.classList.remove('hidden');
  document.getElementById('form-categoria').reset();
  document.getElementById('categoria-id-edit').value = '';
}

export function cerrarModalCategorias(modalCategorias) {
  modalCategorias.classList.add('hidden');
}

// --- Funciones de Navegación ---
export function activateTab(tabId, navButtons) {
  // Desactivar todos los botones de navegación
  navButtons.forEach(button => button.classList.remove('active'));
  // Activar el botón de navegación correspondiente
  document.querySelector(`button[data-tab="${tabId}"]`).classList.add('active');

  // Ocultar todas las secciones de contenido
  document.querySelectorAll('section.tab').forEach(section => section.classList.remove('active'));
  // Mostrar la sección de contenido correspondiente
  document.getElementById(tabId).classList.add('active');
}
