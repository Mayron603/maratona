// Em produção (Vercel), usa caminho relativo. Localmente, usa localhost:5000.
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

const normalize = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item._id || item.id }));
  }
  if (data && typeof data === 'object') {
    return { ...data, id: data._id || data.id };
  }
  return data;
};

export const base44 = {
  auth: {
    login: async (email, password) => {
      const data = await fetchAPI('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', data.token);
      return data.user;
    },
    register: async (name, email, password) => fetchAPI('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    me: async () => { try { return await fetchAPI('/me'); } catch { return null; } },
    logout: async () => { localStorage.removeItem('token'); window.location.href = '/login'; }
  },
  entities: {
    Goal: {
      list: async () => normalize(await fetchAPI('/goals')),
      create: async (data) => normalize(await fetchAPI('/goals', { method: 'POST', body: JSON.stringify(data) })),
      update: async (id, data) => normalize(await fetchAPI(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
      delete: async (id) => fetchAPI(`/goals/${id}`, { method: 'DELETE' }),
    },
    Marathon: {
      list: async () => normalize(await fetchAPI('/marathons')),
      create: async (data) => normalize(await fetchAPI('/marathons', { method: 'POST', body: JSON.stringify(data) })),
      delete: async (id) => fetchAPI(`/marathons/${id}`, { method: 'DELETE' }),

      // --- NOVAS FUNÇÕES ---
      getMyProgressList: async () => fetchAPI('/my-progress'), // Pega todas as inscrições
      subscribe: async (id) => fetchAPI(`/marathons/${id}/subscribe`, { method: 'POST' }),
      
      // Funções novas para progresso
      getProgress: async (marathonId) => fetchAPI(`/marathons/${marathonId}/progress`),
      updateTask: async (marathonId, taskId, completed, note) => 
        fetchAPI(`/marathons/${marathonId}/task`, { 
          method: 'POST', 
          body: JSON.stringify({ taskId, completed, note }) 
        }),
        
      filter: async (criteria) => {
        const all = normalize(await fetchAPI('/marathons'));
        if (criteria.id) return all.filter(m => m.id === criteria.id);
        return all;
      }
    },
    Settings: {
      // Adicionamos normalize(...) aqui para converter _id em id
      list: async () => normalize(await fetchAPI('/settings')),
      
      create: async (data) => fetchAPI('/settings', { method: 'POST', body: JSON.stringify(data) }),
      update: async (id, data) => fetchAPI(`/settings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    }
  }
};