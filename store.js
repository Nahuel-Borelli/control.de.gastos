// =====================================================================================
// ESTADO CENTRALIZADO DE LA APLICACIÓN
// =====================================================================================
// Este objeto contiene todos los datos dinámicos de la aplicación.
// Los demás módulos lo importarán para leer de él o para actualizarlo.
// =====================================================================================

export const state = {
  monedas: [],
  categorias: [],
  gastos: [],
  kpis: { total_usd: 0, gastos_por_categoria: [] },
  ui: {
    editingGastoId: null,
  },
};
