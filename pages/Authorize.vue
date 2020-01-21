<template lang='pug'>
  el-card.mt-5
    h4(slot='header') <nuxt-link :to='"/"'><img src='/favicon.ico'/></nuxt-link> {{settings.title}} - {{$t('common.authorize')}}
    div
      h5 <u>{{$auth.user.email}}</u>
      p External application <code>{{client.name}}</code> want following permission grants:
      ul
        li(v-for="s in scope.split(' ')") {{s}}
      span(v-if='redirect_uri!=="urn:ietf:wg:oauth:2.0:oob"') You will be redirected to <code>{{$route.query.redirect_uri}}</code>
      el-row.mt-3(justify='center')
        el-col(:span='12' :offset='6' style='text-align: center')
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
    if (!scope || scope !== 'write') {
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
