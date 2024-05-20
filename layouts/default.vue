<template>
  <v-app>
    <Appbar/>
    <v-main>
      <Snackbar/>
      <Confirm/>
      <v-fade-transition hide-on-leave>
        <nuxt />
      </v-fade-transition>
    </v-main> 
    <Footer/>

  </v-app>


</template>
<script>
import Appbar from '../components/Appbar.vue'
import Snackbar from '../components/Snackbar.vue'
import Footer from '../components/Footer.vue'
import Confirm from '../components/Confirm.vue'
import { mapState, mapGetters } from 'vuex'

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
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['is_dark'])
  },
  created () {
    try {
      this.$vuetify.theme.dark = this.is_dark
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
