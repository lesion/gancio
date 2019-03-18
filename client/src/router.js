import Vue from 'vue'
import Router from 'vue-router'

import Settings from './components/Settings'
import newEvent from './components/newEvent'
import EventDetail from './components/EventDetail'
import Login from './components/Login'
import Register from './components/Register'
import Export from './components/Export'
import Admin from './components/Admin'
import About from './components/About'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/admin',
      components: { modal: Admin }
    },
    {
      path: '/register',
      components: { modal: Register }
    },
    {
      path: '/login',
      components: { modal: Login }
    },
    {
      path: '/new_event',
      components: { modal: newEvent }
    },
    {
      path: '/settings',
      components: { modal: Settings }
    },
    {
      path: '/event/:id',
      components: { modal: EventDetail }
    },
    {
      path: '/edit/:id',
      components: { modal: newEvent },
      props: { edit: true }
    },
    {
      path: '/export',
      components: { modal: Export }
    },
    {
      path: '/admin/oauth',
      components: { modal: Admin }
    },
    {
      path: '/about',
      components: { modal: About }
    }
  ]
})
