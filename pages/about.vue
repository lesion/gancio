<template lang="pug">
  v-container
    .edit(v-if='$auth.user && $auth.user.is_admin')
      Editor(v-if='$auth.user && $auth.user.is_admin'
        v-model='about')
      v-btn.float-right(type='success' plain icon='el-icon-check'
        @click='save') {{$t('common.save')}}
    div(v-else v-html='about')
</template>
<script>
import Editor from '@/components/Editor'
import { mapState, mapActions } from 'vuex'
import { Message } from 'element-ui'

export default {
  components: { Editor },
  data ({ $store }) {
    return {
      about: $store.state.settings.about || this.$t('about')
    }
  },
  computed: mapState(['settings']),
  methods: {
    ...mapActions(['setSetting']),
    save () {
      Message({
        showClose: true,
        type: 'success',
        message: this.$t('common.done')
      })
      this.setSetting({ key: 'about', value: this.about })
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.info')}`
    }
  }
}
</script>
