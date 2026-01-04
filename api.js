export const API_URL = 'https://gastos-api-gb9n.onrender.com';

// --- Gastos ---
export async function getGastos(fecha_inicio, fecha_fin) {
  const params = new URLSearchParams();
  if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
  if (fecha_fin) params.append('fecha_fin', fecha_fin);
  
  const res = await fetch(`${API_URL}/gastos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudieron cargar los gastos');
  return await res.json();
}

export async function getGasto(id) {
  const res = await fetch(`${API_URL}/gastos/${id}`);
  if (!res.ok) throw new Error('No se pudo obtener el gasto');
  return await res.json();
}

export async function getResumen(fecha_inicio, fecha_fin) {
  const params = new URLSearchParams({ fecha_inicio, fecha_fin });
  const res = await fetch(`${API_URL}/gastos/resumen?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el resumen');
  return await res.json();
}

export async function deleteGasto(id) {
  const res = await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('El servidor rechazó la eliminación');
  return await res.json();
}

export async function updateGasto(id, gasto) {
  const res = await fetch(`${API_URL}/gastos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasto)
  });
  if (!res.ok) throw new Error('No se pudo actualizar el gasto');
  return await res.json();
}

export async function createGasto(gasto) {
    const res = await fetch(`${API_URL}/gastos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasto)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error desconocido al crear gasto');
  return await res.json();
}


// --- Categorías ---
export async function getCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error('No se pudieron cargar las categorías');
  return await res.json();
}

export async function createCategoria(categoria) {
  const res = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error desconocido al crear categoría');
  return await res.json();
}

export async function updateCategoria(id, categoria) {
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoria)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error desconocido al actualizar categoría');
  return await res.json();
}

export async function deleteCategoria(id) {
  const res = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('El servidor rechazó la eliminación de la categoría');
  return await res.json();
}


// --- Monedas ---
export async function getMonedas() {
  const res = await fetch(`${API_URL}/monedas`);
  if (!res.ok) throw new Error('No se pudieron cargar las monedas');
  return await res.json();
}