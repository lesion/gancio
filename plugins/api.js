
export default ({ $axios, store }, inject) => {

  const api = {

    /**
     * Get events
     * 
     * filter: {
     *    start_datetime: unix_timestamp (default now)
     *    end_datetime:   unix_timestamp
     *    tags: [tag, list],
     *    places: [place_id],
     *    limit: (default ∞)
     * }
     * 
     */
    async getEvents (params) {
      try {
        const events = await $axios.$get(`/events`, { params: {
          start: params.start,
          end: params.end,
          places: params.places && params.places.join(','),
          tags: params.tags && params.tags.join(',')
        }} )
        return events
      } catch (e) {
        console.error(e)
        return []
      }
    }
  }
  inject('api', api)
}