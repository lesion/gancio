<template>
  <v-app app>
    <Snackbar/>
    <Confirm/>
    <Nav/>
    <v-main app>
      <div class="ml-1 mb-1 mt-1" v-if='showCohorts || showBack'>
        <v-btn v-show='showBack' text color='primary' to='/'><v-icon v-text='mdiChevronLeft'/></v-btn>
        <v-btn v-for='cohort in cohorts' text color='primary' :key='cohort.id' :to='`/g/${cohort.name}`'>{{cohort.name}}</v-btn>
      </div>      
      <v-fade-transition hide-on-leave>
        <nuxt />
      </v-fade-transition>
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
      }
    }
  },
  data () {
    return { cohorts: [], mdiChevronLeft }
  },  
  async fetch () {
    this.cohorts = await this.$axios.$get('cohorts')
  },  
  name: 'Default',
  components: { Nav, Snackbar, Footer, Confirm },
  computed: {
    ...mapState(['settings', 'locale']),
    showBack () {
      return ['tag-tag', 'g-cohort', 'p-place', 'search', 'announcement-id'].includes(this.$route.name)
    },
    showCohorts () {
      if (!this.cohorts || this.cohorts.length === 0) return false
      return ['tag-tag', 'index', 'g-cohort', 'p-place'].includes(this.$route.name)
    }
  },
  created () {
    this.$vuetify.theme.dark = this.settings['theme.is_dark']
  }
}
</script>
