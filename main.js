// main.js
import * as api from './api.js';
import * as ui from './ui.js';
import { state } from './store.js';

// --- Selectores del DOM (Declarados globalmente, inicializados en main()) ---
let gastoForm, gastoIdEditEl, fechaEl, montoEl, monedaEl, categoriaEl,
    modalCategorias, btnGestionarCategorias, btnCerrarModal, formCategoria,
    categoriaIdEditEl, categoriaNombreEl, listaCategoriasGestionEl,
    resumenFechaInicioEl, resumenFechaFinEl, btnFiltrarResumen,
    historialFechaInicioEl, historialFechaFinEl, btnFiltrarHistorial,
    nav, tabs, listaGastosEl, totalPeriodoEl, tablaCategoriasEl;

// =====================================================================================
// FUNCIONES DE CARGA DE DATOS (Hacen fetch, actualizan el state y llaman a render)
// =====================================================================================

async function loadMonedas() {
  try {
    const monedas = await api.getMonedas();
    state.monedas = monedas;
    ui.renderMonedas(monedaEl);
  } catch (error) {
    console.error('Error al cargar monedas:', error);
    ui.showToast('Error al cargar monedas', 'error');
  }
}

async function loadCategorias() {
  try {
    const categorias = await api.getCategorias();
    state.categorias = categorias;
    ui.renderCategorias(categoriaEl, listaCategoriasGestionEl);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    ui.showToast('Error al cargar categorías', 'error');
  }
}

async function loadGastos() {
  ui.showHistorialSkeleton(listaGastosEl);
  try {
    const fecha_inicio = historialFechaInicioEl.value;
    const fecha_fin = historialFechaFinEl.value;
    const gastos = await api.getGastos(fecha_inicio, fecha_fin);
    state.gastos = gastos;
    ui.renderHistorial(listaGastosEl);
  } catch (error) {
    console.error('Error al cargar gastos:', error);
    ui.showToast('Error al cargar gastos', 'error');
    listaGastosEl.innerHTML = '<li>Error al cargar gastos.</li>';
  }
}

async function loadKPIs() {
  ui.showKpiSkeleton(tablaCategoriasEl);
  try {
    const fecha_inicio = resumenFechaInicioEl.value;
    const fecha_fin = resumenFechaFinEl.value;
    const kpis = await api.getResumen(fecha_inicio, fecha_fin);
    state.kpis = kpis;
    ui.renderKPIs(totalPeriodoEl, tablaCategoriasEl);
  } catch (error) {
    console.error('Error al cargar KPIs:', error);
    ui.showToast('Error al cargar resumen', 'error');
    tablaCategoriasEl.innerHTML = '<li>Error al cargar resumen.</li>';
  }
}

// =====================================================================================
// LÓGICA DE EVENTOS Y ORQUESTACIÓN
// =====================================================================================

async function main() {
  console.log('main() function started. (1)');
  // --- Asignación de Selectores del DOM (ahora dentro de main) ---
  gastoForm = document.getElementById('gasto-form');
  gastoIdEditEl = document.getElementById('gasto-id-edit');
  fechaEl = document.getElementById('fecha');
  montoEl = document.getElementById('monto');
  monedaEl = document.getElementById('moneda');
  categoriaEl = document.getElementById('categoria');
  modalCategorias = document.getElementById('modal-categorias');
  btnGestionarCategorias = document.getElementById('btn-gestionar-categorias');
  btnCerrarModal = document.getElementById('modal-close-btn');
  formCategoria = document.getElementById('form-categoria');
  categoriaIdEditEl = document.getElementById('categoria-id-edit');
  categoriaNombreEl = document.getElementById('categoria-nombre');
  listaCategoriasGestionEl = document.getElementById('lista-categorias-gestion');
  resumenFechaInicioEl = document.getElementById('fecha_inicio');
  resumenFechaFinEl = document.getElementById('fecha_fin');
  btnFiltrarResumen = document.getElementById('btn-filtrar');
  historialFechaInicioEl = document.getElementById('historial_fecha_inicio');
  historialFechaFinEl = document.getElementById('historial_fecha_fin');
  btnFiltrarHistorial = document.getElementById('btn-filtrar-historial');
  nav = document.querySelector('nav');
  tabs = document.querySelectorAll('.nav-button'); // Seleccionar los botones de navegación
  listaGastosEl = document.getElementById('lista-gastos');
  totalPeriodoEl = document.getElementById('total-periodo');
  tablaCategoriasEl = document.getElementById('tabla-categorias');
  console.log('main() function: DOM selectors assigned. (2)');

  // --- Inicialización de Fechas ---
  const hoy = new Date();
  const hoyStr = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 30);
  const hace30DiasStr = new Date(hace30Dias.getTime() - (hace30Dias.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  fechaEl.value = hoyStr;
  resumenFechaInicioEl.value = hace30DiasStr;
  resumenFechaFinEl.value = hoyStr;
  historialFechaInicioEl.value = hace30DiasStr;
  historialFechaFinEl.value = hoyStr;
  console.log('main() function: Dates initialized. (3)');

  // --- Event Listeners ---
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const tabId = e.target.dataset.tab;
      ui.activateTab(tabId, tabs);
      if (tabId === 'historial') loadGastos();
      if (tabId === 'resumen') loadKPIs();
    }
  });

  gastoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gasto = {
      fecha: fechaEl.value,
      monto_original: parseFloat(montoEl.value),
      moneda: monedaEl.value,
      categoria_id: parseInt(categoriaEl.value),
    };

    try {
      if (gastoIdEditEl.value) {
        // Edición de gasto
        const id = parseInt(gastoIdEditEl.value);
        await api.updateGasto(id, gasto);
        ui.showToast('Gasto actualizado con éxito');
      } else {
        // Creación de gasto
        await api.createGasto(gasto);
        ui.showToast('Gasto guardado con éxito');
      }
      gastoForm.reset();
      gastoIdEditEl.value = '';
      loadGastos(); // Recargar para reflejar cambios
      loadKPIs();
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      ui.showToast('Error al guardar gasto', 'error');
    }
  });

  listaGastosEl.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
      try {
        await api.deleteGasto(id);
        ui.showToast('Gasto eliminado con éxito');
        loadGastos();
        loadKPIs();
      } catch (error) {
        console.error('Error al eliminar gasto:', error);
        ui.showToast('Error al eliminar gasto', 'error');
      }
    } else if (e.target.classList.contains('edit')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      const gastoToEdit = state.gastos.find(g => g.id === id);

      if (gastoToEdit) {
        fechaEl.value = gastoToEdit.fecha;
        montoEl.value = gastoToEdit.monto_original;
        monedaEl.value = gastoToEdit.moneda;
        categoriaEl.value = gastoToEdit.categoria_id;
        gastoIdEditEl.value = id;
        ui.showToast('Editando gasto...');
        ui.activateTab('tab-carga', tabs); // Cambiar a la pestaña de carga
      }
    }
  });

  btnGestionarCategorias.addEventListener('click', () => ui.abrirModalCategorias(modalCategorias));
  btnCerrarModal.addEventListener('click', () => ui.cerrarModalCategorias(modalCategorias));

  formCategoria.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoria = { nombre: categoriaNombreEl.value };
    try {
      if (categoriaIdEditEl.value) {
        await api.updateCategoria(parseInt(categoriaIdEditEl.value), categoria);
        ui.showToast('Categoría actualizada con éxito');
      } else {
        await api.createCategoria(categoria);
        ui.showToast('Categoría creada con éxito');
      }
      ui.cerrarModalCategorias(modalCategorias);
      await loadCategorias();
      loadKPIs();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      ui.showToast('Error al guardar categoría', 'error');
    }
  });

  listaCategoriasGestionEl.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      const categoria = state.categorias.find(c => c.id === id);
      if (categoria) {
        categoriaNombreEl.value = categoria.nombre;
        categoriaIdEditEl.value = categoria.id;
      }
    } else if (e.target.classList.contains('delete')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      if (!confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán todos los gastos asociados.')) return;
      try {
        await api.deleteCategoria(id);
        ui.showToast('Categoría eliminada con éxito');
        await loadCategorias();
        loadGastos();
        loadKPIs();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        ui.showToast('Error al eliminar categoría', 'error');
      }
    }
  });

  btnFiltrarResumen.addEventListener('click', loadKPIs);
  btnFiltrarHistorial.addEventListener('click', loadGastos);

  monedaEl.addEventListener('change', (e) => {
    localStorage.setItem('lastUsedCurrency', e.target.value);
  });
  console.log('main() function: Event listeners set. (4)');

  // --- Carga inicial de datos ---
  try {
    await loadMonedas();
  } catch (error) {
    console.error('Error en carga inicial de monedas:', error);
    ui.showToast('Error al cargar monedas inicialmente', 'error');
  }
  try {
    await loadCategorias();
  } catch (error) {
    console.error('Error en carga inicial de categorías:', error);
    ui.showToast('Error al cargar categorías inicialmente', 'error');
  }
  try {
    loadGastos(); // Cargar gastos para la pestaña inicial
  } catch (error) {
    console.error('Error en carga inicial de gastos:', error);
    ui.showToast('Error al cargar gastos inicialmente', 'error');
  }
  try {
    loadKPIs(); // Cargar KPIs para la pestaña inicial
  } catch (error) {
    console.error('Error al cargar KPIs inicialmente', 'error');
    ui.showToast('Error al cargar KPIs inicialmente', 'error');
  }
  console.log('main() function: Initial data loaded. (5)');

  // --- Pull to Refresh ---
  // Removed Service Worker and IndexedDB related code
  // setupPullToRefresh(document.getElementById('tab-historial'), loadGastos);
  // setupPullToRefresh(document.getElementById('tab-resumen'), loadKPIs);
  console.log('main() function: Offline capabilities removed. (6)'); // Updated log
}

document.addEventListener('DOMContentLoaded', main);
