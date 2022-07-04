import { store } from 'nuxt3-store'
import { useNuxtApp } from '#app'

const user = store({
  name: 'user',
  type: 'localstorage',
  value: { token: null, user: null },
  reactiveType: 'reactive',
  version: '1.0.0',
})

export const useUser = () => {
  const { $api } = useNuxtApp()

  const getUser = async (args = {}) => {
    user.user = await $api.auth.me(args, {
      headers: {
        'xc-auth': user.value.token,
      },
    })
  }

  const setToken = (token) => {
    user.token = token
  }

  return { user, setToken, getUser }
}
