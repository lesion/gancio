<template lang='pug'>
v-app(app)
  Snackbar
  Confirm

  v-main(app)
    v-fade-transition(hide-on-leave)
      nuxt

</template>
<script>
import Snackbar from '../components/Snackbar'
import Confirm from '../components/Confirm'

export default {
  name: 'Default',
  components: { Snackbar, Confirm },
  created () {
    this.$vuetify.theme.dark = false
  }
}
</script>
