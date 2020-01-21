<template lang='pug'>
  el-card.mt-5
    h4(slot='header')
      nuxt-link(to='/')
        img(src='/favicon.ico')
      span  {{settings.title}} - {{$t('common.authorize')}}
    <u>{{$auth.user.email}}</u>
    div
      p(v-html="$t('oauth.authorization_request', { app: client.name, instance_name: settings.title })")
      ul
        li(v-for="s in scope.split(' ')") {{$t(`oauth.scopes.${scope}`)}}
      span(v-html="$t('oauth.redirected_to', {url: $route.query.redirect_uri})")
      br
      br
      a(:href='authorizeURL')
        el-button.mr-1(plain type='success') {{$t('common.authorize')}}
      a(href='/')
        el-button.mt-1(plain type='warning') {{$t('common.cancel')}}
</template>

<script>
import { mapState } from 'vuex'

export default {
  layout: 'modal',
  name: 'Authorize',
  middleware: ['auth'],
  async asyncData ({ $axios, query, error, req }) {
    const { client_id, redirect_uri, scope, response_type } = query
    let err = ''
    if (!client_id) {
      err = 'client_id is missing'
    }
    if (!redirect_uri) {
      err = 'redirect_uri is missing'
    }
    if (!scope || scope !== 'event:write') {
      err = 'scope is missing or wrong'
    }
    if (!response_type || response_type !== 'code') {
      err = 'response_type is missing or wrong'
    }

    // retrieve client validity
    try {
      const client = await $axios.$get(`/client/${client_id}`)
      if (!client) {
        err = 'client not found'
      }
      if (err) {
        return error({ statusCode: 404, message: err })
      }
      return { client, redirect_uri, scope, response_type }
    } catch (e) {
      error({ statusCode: 400, message: 'Something goes wrong with OAuth authorization' })
    }
  },
  data () {
    return {
      client: { name: 'Test' }
    }
  },
  computed: {
    ...mapState(['settings']),
    authorizeURL () {
      const { scope, response_type, client_id, redirect_uri, state } = this.$route.query
      const query = `client_id=${client_id}&response_type=${response_type}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`
      return `oauth/authorize?${query}`
    }
  },
  head () {
    return { title: `${this.settings.title} - Authorize` }
  }
}
</script>
<style lang='less'>
  h4 img {
    max-height: 40px;
    border-radius: 20px;
    background-color: #333;
    border: 1px solid #333;
  }
</style>
