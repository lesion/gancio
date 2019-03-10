<template lang="pug">
  b-modal(:title="$t('Settings')" hide-footer @hide='$router.go(-1)' :visible='true')
    el-form(inline)
      el-input(v-model="mastodon_instance")
        span(slot='prepend') Mastodon instance
        el-button(slot='append' @click='associate' type='success') Associate

</template>
<script>
import { mapState, mapActions } from 'vuex'
import api from '@/api'
export default {
  props: ['code'],
  data () {
    return {
      mastodon_instance: '',
      user: {}
    }
  },
  computed: mapState(['oauth']),
  async mounted () {
    const code = this.$route.query.code
    if (code) {
      const res = await api.setCode({code})
    }

    const user = await api.getUser()
    this.user = user
    this.mastodon_instance = user.mastodon_instance
  },
  methods: {
      async associate () {
        if (!this.mastodon_instance) return
        const url = await api.getAuthURL({instance: this.mastodon_instance})
        setTimeout( () => window.location.href=url, 100);
    }
  }
}
</script>

