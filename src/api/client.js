import axios from 'axios'
import { fetchAuthSession, signOut } from 'aws-amplify/auth'
import awsConfig from '../aws-config'

const api = axios.create({
  baseURL: awsConfig.Api.url,
})

api.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut()
      return Promise.reject(error)
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Nieznany błąd'

    return Promise.reject(new Error(message))
  },
)

export default api
