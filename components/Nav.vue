<template lang="pug">
  b-navbar(type="dark" variant="dark" toggleable='md')
    b-navbar-toggle(target='nav_collapse')
    b-navbar-brand(to='/') <img id='logo' src='gancio_logo.svg'/>
    b-collapse#nav_collapse(is-nav)
      b-navbar-nav
        b-nav-item(v-if='!$auth.loggedIn' to='/login'  v-b-tooltip :title='$t("common.login")') <v-icon color='lightgreen' name='lock' /> 
          span.d-md-none  {{$t('common.login')}}
        b-nav-item(to='/add' v-b-tooltip :title='$t("common.add_event")' ) <v-icon color='lightgreen' name='plus'/> 
          span.d-md-none  {{$t('common.add_event')}}
        b-nav-item(v-if='$auth.loggedIn' to='/settings' v-b-tooltip :title='$t("common.settings")') <v-icon color='orange' name='cog'/>
          span.d-md-none  {{$t('common.settings')}}
        b-nav-item(v-if='$auth.hasScope(`admin`)' to='/admin' v-b-tooltip :title='$t("common.admin")') <v-icon color='lightblue' name='tools'/>
          span.d-md-none  {{$t('common.admin')}}
        b-nav-item(to='/export' v-b-tooltip :title='$t("common.export")') <v-icon name='file-export' color='yellow'/>
          span.d-md-none  {{$t('common.export')}}
        b-nav-item(v-if='auth.loggedIn' @click='logout' v-b-tooltip :title='$t("common.logout")') <v-icon color='red' name='sign-out-alt'/>
          span.d-md-none  {{$t('common.logout')}}
    b-navbar-nav.ml-auto
        b-nav-item(to='/about')
          span  {{$t('common.info')}} <v-icon color='#ff9fc4' name='question-circle'/>

</template>
<script>
import {mapState, mapActions} from 'vuex'
export default {
  name: 'Nav',
  computed: {
    ...mapState(['filters', 'auth']),
    filters_tags: {
      set (value) {
        this.setSearchTags(value)
      },
      get () {
        return this.filters.tags
      }
    },
    filters_places: {
      set (value) {
        this.setSearchPlaces(value)
      },
      get () {
        return this.filters.places
      }
    },
  },
  methods: mapActions(['logout']),
}
</script>

