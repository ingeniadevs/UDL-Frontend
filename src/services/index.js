import api from './api'

export const authService = {
  async loginAdmin(email, password) {
    console.log("base url:",api.defaults.baseURL);
    const response = await api.post('/auth/admin/login', { email, password })
    return response.data
  },

  async loginSocio(email, password) {
    const response = await api.post('/auth/socio/login', { email, password })
    return response.data
  },

  async verify() {
    const response = await api.get('/auth/verify')
    return response.data
  }
}

export const sociosService = {
  async getAll() {
    const response = await api.get('/socios')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/socios/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/socios', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/socios/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/socios/${id}`)
    return response.data
  }
}

export const disciplinasService = {
  async getAll() {
    const response = await api.get('/disciplinas')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/disciplinas/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/disciplinas', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/disciplinas/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/disciplinas/${id}`)
    return response.data
  }
}

export const pagosService = {
  async getAll(socioId = null) {
    const params = socioId ? { socioId } : {}
    const response = await api.get('/pagos', { params })
    return response.data
  },

  async getBySocio(socioId) {
    const response = await api.get(`/pagos/socio/${socioId}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/pagos', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/pagos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/pagos/${id}`)
    return response.data
  },

  // Pago en efectivo (admin confirma)
  async registrarPagoEfectivo(pagoId) {
    const response = await api.post(`/pagos/${pagoId}/pagar-efectivo`)
    return response.data
  },

  // Solicitar pago en efectivo (socio) - múltiples pagos
  async solicitarPagoEfectivo(pagoIds) {
    const response = await api.post('/pagos/solicitar-efectivo', { PagoIds: pagoIds })
    return response.data
  },

  // MercadoPago individual
  async initMercadoPago(pagoId) {
    const response = await api.post(`/pagos/${pagoId}/mercadopago/init`)
    return response.data
  },

  // MercadoPago múltiple
  async initMercadoPagoMultiple(pagoIds) {
    const response = await api.post('/pagos/mercadopago/init-multiple', { PagoIds: pagoIds })
    return response.data
  },

  // Confirmar múltiples pagos en efectivo (admin)
  async confirmarPagosEfectivo(pagoIds) {
    const response = await api.post('/pagos/confirmar-efectivo', { PagoIds: pagoIds })
    return response.data
  },

  async checkMercadoPagoStatus(pagoId) {
    const response = await api.get(`/pagos/${pagoId}/mercadopago/status`)
    return response.data
  },

  // Cuota total con disciplinas
  async getCuotaTotal(socioId) {
    const response = await api.get(`/pagos/socio/${socioId}/cuota-total`)
    return response.data
  },

  // Generar cuota mensual (incluye disciplinas activas)
  async generarCuotaMensual(socioId, data) {
    const response = await api.post(`/pagos/socio/${socioId}/generar-cuota`, data)
    return response.data
  }
}

export const productosService = {
  async getAll() {
    const response = await api.get('/productos')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/productos/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/productos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/productos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/productos/${id}`)
    return response.data
  }
}

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteImage(fileName) {
    const response = await api.delete(`/upload/image/${fileName}`)
    return response.data
  }
}

export const pedidosService = {
  async getAll() {
    const response = await api.get('/pedidos')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/pedidos/${id}`)
    return response.data
  },

  async getBySocio(socioId) {
    const response = await api.get(`/pedidos/socio/${socioId}`)
    return response.data
  },

  async getMisPedidos() {
    const response = await api.get('/pedidos/mis-pedidos')
    return response.data
  },

  async create(data) {
    const response = await api.post('/pedidos', data)
    return response.data
  },

  async updateEstado(id, data) {
    const response = await api.put(`/pedidos/${id}/estado`, data)
    return response.data
  },

  // MercadoPago
  async initMercadoPago(pedidoId) {
    const response = await api.post(`/pedidos/${pedidoId}/mercadopago/init`)
    return response.data
  }
}

export const empleadosService = {
  async getAll() {
    const response = await api.get('/empleados')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/empleados/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/empleados', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/empleados/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/empleados/${id}`)
    return response.data
  }
}

export const inscripcionesService = {
  async getMisInscripciones() {
    const response = await api.get('/inscripciones/mis-inscripciones')
    return response.data
  },

  async inscribirse(disciplinaId) {
    const response = await api.post('/inscripciones/inscribirse', { disciplinaId })
    return response.data
  },

  async cancelar(disciplinaId) {
    const response = await api.post('/inscripciones/cancelar', { disciplinaId })
    return response.data
  }
}

export const espaciosService = {
  async getAll(soloActivos = null) {
    const params = soloActivos !== null ? { soloActivos } : {}
    const response = await api.get('/espacios', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/espacios/${id}`)
    return response.data
  },

  async getTurnosDisponibles(id, fecha) {
    const response = await api.get(`/espacios/${id}/turnos/${fecha}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/espacios', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/espacios/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/espacios/${id}`)
    return response.data
  }
}

export const reservasService = {
  async getAll(params = {}) {
    const response = await api.get('/reservas', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/reservas/${id}`)
    return response.data
  },

  async getMisReservas() {
    const response = await api.get('/reservas/mis-reservas')
    return response.data
  },

  async getBySocio(socioId) {
    const response = await api.get(`/reservas/socio/${socioId}`)
    return response.data
  },

  async getByEspacioAndFecha(espacioId, fecha) {
    const response = await api.get(`/reservas/espacio/${espacioId}/fecha/${fecha}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/reservas', data)
    return response.data
  },

  async createAdmin(data) {
    const response = await api.post('/reservas/admin', data)
    return response.data
  },

  async updateEstado(id, data) {
    const response = await api.put(`/reservas/${id}/estado`, data)
    return response.data
  },

  async cancelar(id) {
    const response = await api.post(`/reservas/${id}/cancelar`)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/reservas/${id}`)
    return response.data
  },

  // ==================== PAGOS ====================

  // Resumen de pagos (admin)
  async getResumenPagos(params = {}) {
    const response = await api.get('/reservas/pagos/resumen', { params })
    return response.data
  },

  // MercadoPago individual
  async initMercadoPago(reservaId) {
    const response = await api.post(`/reservas/${reservaId}/mercadopago/init`)
    return response.data
  },

  // MercadoPago múltiple
  async initMercadoPagoMultiple(reservaIds) {
    const response = await api.post('/reservas/mercadopago/init-multiple', { reservaIds })
    return response.data
  },

  // Solicitar pago en efectivo (socio)
  async solicitarPagoEfectivo(reservaIds) {
    const response = await api.post('/reservas/solicitar-efectivo', { reservaIds })
    return response.data
  },

  // Confirmar pago en efectivo (admin)
  async confirmarPagoEfectivo(reservaIds) {
    const response = await api.post('/reservas/confirmar-efectivo', { reservaIds })
    return response.data
  }
}
