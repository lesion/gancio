<template lang='pug'>
  #app
    b-navbar(type="dark" variant="dark" toggleable='lg')
      b-navbar-brand(to='/') Gancio 
      b-navbar-toggle(target='nav_collapse')
      b-collapse#nav_collapse(is-nav)
        b-navbar-nav.ml-auto(v-if='logged')
          b-nav-item(to='/new_event') <v-icon color='lightgreen' name='plus'/> {{$t('Add Event')}}
          b-nav-item(@click='search=!search') <v-icon color='lightgreen' name='search'/> {{$t('Search')}}
          b-nav-item(to='/settings') <v-icon color='orange' name='cog'/> {{$t('Settings')}}
          b-nav-item(v-if='user.is_admin' to='/admin') <v-icon color='lightblue' name='tools'/> {{$t('Admin')}}
          b-nav-item(variant='danger' @click='logout') <v-icon color='red' name='sign-out-alt'/> {{$t('Logout')}}
        b-navbar-nav.ml-auto(v-else)
          b-nav-item(@click='search=!search') <v-icon color='lightgreen' name='search'/> {{$t('Search')}}
          b-nav-item(to='/register') {{$t('Register')}}
          b-nav-item(to='/login') {{$t('Login')}}
    transition(name='toggle')
      b-navbar#search(v-if='search' type='dark' variant="dark" toggleable='lg')
        b-navbar-nav
          b-nav-form
            typeahead.ml-1(v-model='filters_places' 
              textField='name' valueField='name'
              updateOnMatchOnly
              :data='places' multiple placeholder='Luogo')
          b-nav-form
            typeahead.ml-1(v-model='filters_tags'
              updateOnMatchOnly
              textField='tag' valueField='tag'
              :data='tags' multiple placeholder='Tags')
        b-navbar-nav.ml-auto(variant='dark')
          b-nav-item(to='/export/feed' href='#') <v-icon color='orange' name='rss'/> feed
          b-nav-item(to='/export/ics') <v-icon color='orange' name='calendar'/> cal
          b-nav-item(to='/export/email') <v-icon color='orange' name='envelope'/> mail
          b-nav-item(to='/export/embed') <v-icon color='orange' name='code'/> embed
          b-nav-item(to='/export/print') <v-icon color='orange' name='print'/> print
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
  data () {
    return {search: false}
  },
  components: { Register, Login, Home, Settings, newEvent, eventDetail },
  computed: {
    ...mapState(['logged', 'user', 'filters', 'tags', 'places']),
    filters_tags: {
      set (value) {
        console.log('dentro set ', value)
        this.setSearchTags(value)
      },
      get () {
        console.log('dentro get')
        console.log(this.filters)
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
#footer {
  position: absolute;
  width: 100%;
  bottom: 0px;
}

#search,
#search ul {
  align-items: baseline;
}

html, body {
  scrollbar-face-color: #313543;
  scrollbar-track-color: rgba(0, 0, 0, 0.1); 
  font-family: Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;
  font-size: 1.1em;
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
