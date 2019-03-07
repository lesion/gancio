<template lang="pug">
  b-navbar(type="dark" variant="dark" toggleable='md')
    b-navbar-toggle(target='nav_collapse')
    b-navbar-brand(to='/') <img id='logo' src='gancio_logo.svg'/>
    b-collapse#nav_collapse(is-nav)
      b-navbar-nav
        b-nav-item(v-if='!logged' to='/login'  v-b-tooltip :title='$t("Login")') <v-icon color='lightgreen' name='lock' /> 
          span.d-md-none  {{$t('User')}}
        b-nav-item(to='/new_event' v-b-tooltip :title='$t("Add Event")' ) <v-icon color='lightgreen' name='plus'/> 
          span.d-md-none  {{$t('Add Event')}}
        b-nav-item(v-if='logged' to='/settings' v-b-tooltip :title='$t("Settings")') <v-icon color='orange' name='cog'/>
          span.d-md-none  {{$t('Settings')}}
        b-nav-item(v-if='user.is_admin' to='/admin' v-b-tooltip :title='$t("Admin")') <v-icon color='lightblue' name='tools'/>
          span.d-md-none  {{$t('Admin')}}
        b-nav-item(to='/export' v-b-tooltip :title='$t("Export")') <v-icon name='file-export' color='yellow'/>
          span.d-md-none  {{$t('Export')}}
        b-nav-item(v-if='logged' variant='danger' @click='logout' v-b-tooltip :title='$t("Logout")') <v-icon color='red' name='sign-out-alt'/>
          span.d-md-none  {{$t('Logout')}}
</template>
<script>
import {mapState, mapActions} from 'vuex'
export default {
  name: 'Nav',
  computed: {
    ...mapState(['logged', 'user','filters']),
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

