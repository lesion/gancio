
export default ({ $axios }, inject) => {
  const api = {

    /**
     * Get events
     *
     * filter: {
     *    start_datetime: unix_timestamp (default now)
     *    end_datetime:   unix_timestamp
     *    tags: [tag, list],
     *    places: [place_id],
     *    max: (default ∞)
     * }
     *
     */
    async getEvents (params) {
      try {
        const events = await $axios.$get('/events', {
          params: {
            ...params,
            // start: params.start,
            // end: params.end,
            places: params.places && params.places.join(','),
            tags: params.tags && params.tags.join(','),
            // ...(params.show_recurrent !==  && {show_recurrent: !!params.show_recurrent}),
            // show_multidate: !!params.show_multidate,
            // query: params.query,
            // max: params.maxs
          }
        })
        return events.map(e => Object.freeze(e))
      } catch (e) {
        console.error(e)
        return []
      }
    }
  }
  inject('api', api)
}
