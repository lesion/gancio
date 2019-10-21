<template lang="pug">
  div
    el-form(inline label-width='400px')
      el-form-item(:label="$t('admin.enable_federation')")
        el-switch(v-model='enable_federation')
      el-form-item(:label="$t('admin.enable_comments')")
        el-switch(v-model='enable_comments')
      el-form-item(:label="$t('admin.disable_gamification')")
        el-switch(v-model='disable_gamification')
</template>
<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Federation',
  methods: mapActions(['setSetting']),
  computed: {
    ...mapState(['settings']),
    enable_federation: {
      get () { return this.settings.enable_federation },
      set (value) { this.setSetting({ key: 'enable_federation', value }) }
    },
    enable_comments: {
      get () { return this.settings.enable_comments },
      set (value) { this.setSetting({ key: 'enable_comments', value }) }      
    },
    disable_gamification: {
      get () { return this.settings.disable_gamification },
      set (value) { this.setSetting({ key: 'disable_gamification', value }) }
    },
  }
}
</script>