<template lang='pug'>
  #app
    b-navbar(type="dark" variant="dark" toggleable='lg')
      b-navbar-toggle(target='nav_collapse')
      b-navbar-brand(to='/') <img id='logo' src='gancio_logo.svg'/>
      b-collapse#nav_collapse(is-nav)
        b-navbar-nav
          b-nav-item(v-if='!logged' to='/login'  v-b-tooltip :title='$t("Login")') <v-icon color='lightgreen' name='lock' /> {{$t('User')}}
          //- b-nav-item(v-if='!logged' to='/register' v-b-tooltip :title='$t("Register")' ) <v-icon color='orange' name='user' scale='2'/>
          b-nav-item(v-if='logged' to='/new_event' v-b-tooltip :title='$t("Add Event")' ) <v-icon color='lightgreen' name='plus'/> 
          b-nav-item(v-if='logged' to='/settings' v-b-tooltip :title='$t("Settings")') <v-icon color='orange' name='cog'/>
          b-nav-item(v-if='user.is_admin' to='/admin' v-b-tooltip :title='$t("Admin")') <v-icon color='lightblue' name='tools'/>
          b-nav-item(to='/export' v-b-tooltip :title='$t("Export")') <v-icon name='file-export' color='yellow'/>
          b-nav-item(v-if='logged' variant='danger' @click='logout' v-b-tooltip :title='$t("Logout")') <v-icon color='red' name='sign-out-alt'/>
        b-navbar-nav#search.ml-auto
          b-nav-item <v-icon name='search' color='orange' />
          b-nav-form
            el-select.mr-1(v-model='filters_places' multiple filterable collapse-tags
              default-first-option :placeholder='$t("Where")')
              el-option(v-for='place in places' :value='place.name'
                :label='place.name' :key='place.id')
            el-select(v-model='filters_tags' multiple filterable collapse-tags
              default-first-option :placeholder='$t("Tags")')
              el-option(v-for='tag in tags' :key='tag.tag'
                :label='tag.tag' :value='tag.tag') 
    Home
    transition(name="fade" mode="out-in")
      router-view(name='modal')
</template>
<script>
import moment from 'moment'
import api from '@/api'
import { mapActions, mapState } from 'vuex';
import Register from '@/components/Register'
import Login from '@/components/Login'
import Settings from '@/components/Settings'
import newEvent from '@/components/newEvent'
import eventDetail from '@/components/EventDetail'
import Timeline from '@/components/Timeline'
import Home from '@/components/Home'

export default {
  name: 'App',
  mounted () {
    this.updateMeta()
  },
  components: { Register, Login, Home, Settings, newEvent, eventDetail },
  computed: {
    ...mapState(['logged', 'user', 'filters', 'tags', 'places']),
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
    }
  },
  methods: mapActions(['logout', 'updateMeta', 'addSearchTag', 
    'setSearchTags', 'setSearchPlaces', 'addSearchPlace']),
}
</script>

<style>
#logo {
  max-height: 60px;
}

.navbar-brand {
  padding: 0px;
}

#search,
#search ul {
  align-items: baseline;
}

html, body {
  scrollbar-face-color: #313543;
  scrollbar-track-color: rgba(0, 0, 0, 0.1); 
  font-family: Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;
  color: #2c3e50;
  background: black;
}

::-webkit-scrollbar {
  width: 7px;
  height: 7px; }
::-webkit-scrollbar-thumb {
  background: #313543;
  border: 0px none #ffffff;
  border-radius: 6px; }
::-webkit-scrollbar-thumb:hover {
  background: #353a49; }
::-webkit-scrollbar-thumb:active {
  background: #313543; }
::-webkit-scrollbar-track {
  border: 0px none #ffffff;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1); }
::-webkit-scrollbar-track:hover {
  background: #282c37; }
::-webkit-scrollbar-track:active {
  background: #282c37; }
::-webkit-scrollbar-corner {
  background: transparent; }


/* .column {
  margin-top: 3px;
  margin-right: 3px;
  margin-bottom: 3px;
  width: 350px;
} */

</style>
