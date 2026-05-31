import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Fetch every page from a paginated Laravel API resource. */
export async function fetchAllPaginated(path, params = {}, perPage = 250) {
  const all = []
  let page = 1
  let lastPage = 1
  do {
    const { data } = await api.get(path, { params: { per_page: perPage, page, ...params } })
    all.push(...(data.data ?? []))
    lastPage = data.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)
  return all
}

export default api
