<template lang="pug">
v-container
  v-card
    v-card-text(v-if='$auth.user && $auth.user.is_admin')
      Editor.px-3.ma-0(v-model='about' label="About")
    v-card-text(v-else v-html='about')
    v-card-actions(v-if='$auth.user && $auth.user.is_admin')
      v-spacer
      v-btn(color='primary' text
        @click='save') {{$t('common.save')}}
</template>
<script>
import Editor from '@/components/Editor'
import { mapState, mapActions } from 'vuex'

export default {
  components: { Editor },
  data ({ $store }) {
    return {
      about: $store.state.settings.about || this.$t('about')
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.info')}`
    }
  },
  computed: mapState(['settings']),
  methods: {
    ...mapActions(['setSetting']),
    save () {
      this.$root.$message('common.ok', { color: 'success' })
      this.setSetting({ key: 'about', value: this.about })
    }
  }
}
</script>
