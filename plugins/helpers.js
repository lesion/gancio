export default ({ store }, inject) => {

  const helper = {
    mediaURL (event, type, format = '.jpg') {
      const mediaPath = type === 'download' ? '/download/' : '/media/'
      if (event.media && event.media.length) {
        if (type === 'alt') {
          return event.media[0].name
        } else {
          return store.state.settings.baseurl + mediaPath + (type === 'thumb' ? 'thumb/' : '') + event.media[0].url.replace(/.jpg$/, format)
        }
      } else if (type !== 'alt') {
        return store.state.settings.baseurl + mediaPath + (type === 'thumb' ? 'thumb/' : '') + 'logo.svg'
      }
      return ''
    }
  }
  
  
  inject('helper', helper)
}
