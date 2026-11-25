const API_BASE_URL = import.meta.env.VITE_API_URL;

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)acme_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

class ApiService {
  static getHeaders(requiresAuth = false, method = 'GET') {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (requiresAuth && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      const csrf = getCsrfToken();
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
      }
    }

    return headers;
  }

  static async request(endpoint, options = {}, requiresAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const headers = this.getHeaders(requiresAuth, method);

    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...headers,
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Error en la petición');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  static async login(usuario, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password })
    });
  }

  static async logout() {
    return this.request('/auth/logout', { method: 'POST' }, false);
  }

  static async getMe() {
    return this.request('/auth/me', { method: 'GET' }, true);
  }

  static async getUsuarios() {
    return this.request('/auth/usuarios', { method: 'GET' }, true);
  }

  static async createUsuario(payload) {
    return this.request('/auth/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
  }

  static async updateRol(id, rol) {
    return this.request(`/auth/usuarios/${id}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol })
    }, true);
  }

  static async toggleEstadoUsuario(id, activo) {
    return this.request(`/auth/usuarios/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ activo })
    }, true);
  }

  static async getDashboardStats() {
    return this.request('/dashboard/stats', { method: 'GET' }, true);
  }

  static async getEncuestas() {
    return this.request('/encuestas', { method: 'GET' }, true);
  }

  static async getEncuesta(id) {
    return this.request(`/encuestas/${id}`, { method: 'GET' }, true);
  }

  static async getEncuestaById(id) {
    return this.request(`/encuestas/${id}`, { method: 'GET' }, true);
  }

  static async createEncuesta(payload) {
    return this.request('/encuestas', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
  }

  static async updateEncuesta(id, payload) {
    return this.request(`/encuestas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, true);
  }

  static async deleteEncuesta(id) {
    return this.request(`/encuestas/${id}`, {
      method: 'DELETE'
    }, true);
  }

  static async getResultados(id) {
    return this.request(`/encuestas/${id}/resultados`, { method: 'GET' }, true);
  }

  static async getEncuestaPublica(uuid) {
    return this.request(`/public/encuesta/${uuid}`, { method: 'GET' });
  }

  static async responderEncuestaPublica(uuid, valores) {
    return this.request(`/public/encuesta/${uuid}/responder`, {
      method: 'POST',
      body: JSON.stringify({ valores })
    });
  }
}

export default ApiService;
