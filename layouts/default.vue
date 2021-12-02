<template lang='pug'>
  v-app(app)
    Snackbar
    Confirm
    Nav

    v-main(app)
      v-fade-transition(hide-on-leave)
        nuxt

    Footer

</template>
<script>
import Nav from '~/components/Nav.vue'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'
import { mapState } from 'vuex'

export default {
  head () {
    return {
      htmlAttrs: {
        lang: this.locale
      }
    }
  },
  name: 'Default',
  components: { Nav, Snackbar, Footer, Confirm },
  computed: mapState(['settings', 'locale']),
  created () {
    this.$vuetify.theme.dark = this.settings['theme.is_dark']
  }
}
</script>
