<template lang='pug'>
  div
    p(v-html="$t('event.follow_me_description', { title: settings.title, account: `@${settings.instance_name}@${domain}`})")
    el-input(v-model='instance_hostname')
      a(slot='append' :href='link' target='_blank')
        el-button(:disabled='(!couldGo || !proceed)' plain type="primary" icon='el-icon-document') {{$t("common.follow")}}
    p.mt-2 <img class='instance_thumb' :src="instance.thumbnail"/> {{instance.title}}
</template>
<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import debounce from 'lodash/debounce'
import url from 'url'

export default {
  
  name: 'embedEvent',
  data () {
    return {
      instance_hostname: '',
      proceed: false,
      instance: {},
      get_instance_info: debounce(this.getInstanceInfo, 500)
    }
  },
  methods: {
    getInstanceInfo () {
      const instance_url = `https://${this.instance_hostname}/api/v1/instance`
      fetch(instance_url)
        .then( ret => ret.json())
        .then(ret => {
          this.instance = ret
          this.proceed = true
        })
        .catch( e => {
          this.proceed = false
        })
    }
  },
  computed: {
    ...mapState(['settings']),
    domain () {
      const URL = url.parse(this.settings.baseurl)
      return URL.hostname
    },
    couldGo () {
      // check if is mastodon
      const instance_url = `https://${this.instance_hostname}/api/v1/instance`
      this.get_instance_info()
      return true
    },
    link () {
      // check if exists
      return `https://${this.instance_hostname}/authorize_interaction?uri=${this.settings.instance_name}@${this.domain}`
    }
  }
}
</script>
<style lang="less">
.instance_thumb {
  height: 20px;
}
</style>