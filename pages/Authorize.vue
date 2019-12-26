<template lang='pug'>
    //- el-card.mt-5
    //- div(slot='header')
    //-   h4 <img src='/favicon.ico'/>   App authorization
    div(v-if='client')
      h5 <u>{{$auth.user.email}}</u>
      p External application <b>{{client.name}}</b> want following permission grants:
      ul
        li(v-for="scope in $route.query.scope.split(' ')") {{scope}}
      span You will be redirected to <b>{{$route.query.redirect_uri}}</b>
      el-row.mt-3(justify='center')
        el-col(:span='12' :offset='6' style='text-align: center')
          a(:href='authorizeURL')
            el-button.mr-1(plain type='success') {{$t('common.authorize')}}
          a(to='/')
            el-button.mt-1(plain type='warning') {{$t('common.cancel')}}
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { Message } from 'element-ui'
import get from 'lodash/get'

export default {
  layout: 'modal',
  name: 'Authorize',
  middleware: ['auth'],
  head: { title: 'Authorize' },
  data () {
    return {
      client: { name: 'Test' }
    }
  },
  async asyncData ({ $axios, query }) {
    // retrieve client validity
    try {
      const client = await $axios.$get(`/client/${query.client_id}`)
      return { client }
    } catch(e) {
      console.error(e)
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
}
</script>
