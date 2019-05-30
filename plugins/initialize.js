
// TOFIX: not needed in any case (eg. embed)
export default async ({ store, $axios }) => {
  const now = new Date()
  const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
  store.commit('setEvents', events)
  const { tags, places } = await $axios.$get('/event/meta')
  store.commit('update', { tags, places })
}
