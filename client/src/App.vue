<template lang='pug'>
  #app
    Nav
    Home
    transition(name="fade" mode="out-in")
      router-view(name='modal')
</template>

<script>
import moment from 'moment'
import api from '@/api'
import { mapActions } from 'vuex';
import Register from '@/components/Register'
import Login from '@/components/Login'
import Settings from '@/components/Settings'
import newEvent from '@/components/newEvent'
import eventDetail from '@/components/EventDetail'
import Home from '@/components/Home'
import Nav from '@/components/Nav'

export default {
  name: 'App',
  mounted () {
    this.updateMeta()
  },
  methods: mapActions(['updateMeta']),
  components: { Nav, Register, Login, Home, Settings, newEvent, eventDetail },
}
</script>

<style>
#logo {
  max-height: 40px;
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
