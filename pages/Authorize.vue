<template lang='pug'>
v-form.d-flex.justify-space-around(method='post' action='/oauth/authorize')
  v-card.mt-5(max-width='600px')
    v-card-title {{settings.title}} - {{$t('common.authorize')}}
    v-card-text
      h2 {{$auth.user.email}}
      input(name='transaction_id' :value='transactionID' type='hidden')
      u {{$auth.user.email}}

      div
        p(v-html="$t('oauth.authorization_request', { app: client, instance_name: settings.title })")
        ul.mb-2
          li {{$t(`oauth.scopes.${scope}`)}}
        span(v-html="$t('oauth.redirected_to', {url: redirect_uri})")
    v-card-actions
      v-spacer
      v-btn(color='error' to='/' outlined) {{$t('common.cancel')}}
      v-btn(type='submit' color='success' outlined) {{$t('common.authorize')}}
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Authorize',
  layout: 'modal',
  middleware: ['auth'],
  async asyncData ({ $axios, query, error, req }) {
    const { transactionID, client, scope, redirect_uri } = query
    return { transactionID, client, redirect_uri, scope }
  },
  computed: mapState(['settings']),
  head () {
    return { title: `${this.settings.title} - Authorize` }
  }
}
</script>