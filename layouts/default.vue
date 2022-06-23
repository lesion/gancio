<template>
  <v-app app>
    <Snackbar/>
    <Confirm/>
    <Nav/>
    <v-main app>
      <v-container fluid class='pa-0'>
        <div v-if='showCollections || showBack'>
          <v-btn class='ml-2 mt-2' v-if='showBack' outlined color='primary' to='/'><v-icon v-text='mdiChevronLeft'></v-icon></v-btn>
          <v-btn class='ml-2 mt-2' outlined v-for='collection in collections' color='primary' :key='collection.id' :to='`/collection/${collection.name}`'>{{collection.name}}</v-btn>
        </div>
        <v-fade-transition hide-on-leave>
          <nuxt />
        </v-fade-transition>
      </v-container>
    </v-main>
    <Footer/>

  </v-app>


</template>
<script>
import Nav from '~/components/Nav.vue'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'
import { mapState } from 'vuex'
import { mdiChevronLeft } from '@mdi/js'

export default {
  head () {
    return {
      htmlAttrs: {
        lang: this.locale
      },
      link: [{ rel: 'icon', type: 'image/png', href: this.settings.baseurl + '/logo.png' }],
    }
  },
  data () {
    return { collections: [], mdiChevronLeft }
  },  
  async fetch () {
    this.collections = await this.$axios.$get('collections')
  },  
  name: 'Default',
  components: { Nav, Snackbar, Footer, Confirm },
  computed: {
    ...mapState(['settings', 'locale']),
    showBack () {
      return ['tag-tag', 'collection-collection', 'place-place', 'search', 'announcement-id'].includes(this.$route.name)
    },
    showCollections () {
      if (!this.collections || this.collections.length === 0) return false
      return ['tag-tag', 'index', 'g-collection', 'p-place'].includes(this.$route.name)
    }
  },
  created () {
    this.$vuetify.theme.dark = this.settings['theme.is_dark']
  }
}
</script>
