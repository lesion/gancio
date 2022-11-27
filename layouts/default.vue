<template>
  <v-app>
    <Appbar/>
    <v-main>
      <Snackbar/>
      <Confirm/>
        <nuxt :keep-alive='$route.name === "index"'/>
    </v-main>
    <Footer/>

  </v-app>


</template>
<script>
import Appbar from '../components/Appbar.vue'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'
import { mapState } from 'vuex'

export default {
  head () {
    return {
      htmlAttrs: {
        lang: this.locale
      },
      link: [{ rel: 'icon', type: 'image/png', href: this.settings.baseurl + '/logo.png' }],
    }
  },
  name: 'Default',
  components: { Appbar, Snackbar, Footer, Confirm },
  computed: mapState(['settings']),
  created () {
    const theme_is_dark = this.$cookies.get('theme.is_dark')
    if ( theme_is_dark != null ) {
      this.$vuetify.theme.dark = theme_is_dark
    } else {
      this.$vuetify.theme.dark = this.settings['theme.is_dark']
    }
  }
}
</script>
