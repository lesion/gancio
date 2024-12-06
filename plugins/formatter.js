export default ({ app, store }, inject) => {
  const formatter = {
    actor (actor, context='label') {
      if (context === 'title') {
        if (actor?.ap_id) {
          return actor?.object?.name
        } else {
          return 'Local Instance'
        }
      } else if (context === 'label' || context === 'filter') {
        if (actor?.ap_id) {
          return `@${actor?.object?.preferredUsername ?? actor?.name}@${actor?.instanceDomain ?? actor?.domain}`
        } else {
          return `@${store?.state?.settings?.instance_name}@${store?.state?.settings?.hostname}`
        }
      } else if (context === 'icon') {
        if (actor?.ap_id) {
          return actor?.object?.icon?.url ?? `${actor?.instanceDomain ?? actor?.domain ?? ''  }/favicon.ico`
        } else {
          return store.state.settings.baseurl + '/logo.png'
        }
      }
    }
  }
  inject('format', formatter)
}