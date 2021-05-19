<template lang='pug'>
  v-card
    v-card-title(v-text="$t('common.follow_me_title')")
    v-card-text
      p(v-html="$t('event.follow_me_description', { title: settings.title, account: `@${settings.instance_name}@${domain}`})")
      v-text-field(
        :rules="[$validators.required('common.url')]"
        :loading='loading'
        :label="$t('common.url')"
        v-model='instance_hostname')
        v-btn(v-if='!isDialog' slot='prepend' text :disabled='(!couldGo || !proceed)' :href='link' target='_blank'
          :loading='loading' color="primary") {{$t("common.follow")}}

        p(slot='append') <img class='instance_thumb' :src="instance.thumbnail"/> {{instance.title}}

    v-card-actions(v-if='isDialog')
      v-spacer
      v-btn(v-if='isDialog' color='warning' @click="$emit('close')") {{$t("common.cancel")}}
      v-btn(:disabled='(!couldGo || !proceed)' :href='link' target='_blank'
        :loading='loading' color="primary") {{$t("common.follow")}}
</template>
<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'

export default {
  name: 'FollowMe',
  props:
    { isDialog: { type: Boolean, default: false } },
  data () {
    return {
      instance_hostname: '',
      proceed: false,
      instance: {},
      loading: false,
      get_instance_info: debounce(this.getInstanceInfo, 300)
    }
  },

  computed: {
    ...mapState(['settings']),
    domain () {
      const URL = new window.URL(this.settings.baseurl)
      return URL.hostname
    },
    couldGo () {
      // check if is mastodon
      this.get_instance_info(this.instance_hostname)
      return true
    },
    link () {
      // check if exists
      return `https://${this.instance_hostname}/authorize_interaction?uri=${this.settings.instance_name}@${this.domain}`
    }
  },
  methods: {
    getInstanceInfo () {
      if (!this.instance_hostname) {
        return
      }
      this.loading = true

      const instance_url = `https://${this.instance_hostname}/api/v1/instance`
      this.$axios.$get(instance_url)
        .then(ret => {
          this.instance = ret
          this.proceed = true
          this.loading = false
        })
        .catch(e => {
          this.instance = {}
          this.proceed = false
          this.loading = false
        })
    }
  }
}
</script>
<style lang="less">
.instance_thumb {
  height: 20px;
}
</style>
