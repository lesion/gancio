<template lang="pug">
  div
    el-divider {{$t('admin.federation')}}
    el-form(inline label-width='400px')
      el-form-item(:label="$t('admin.enable_federation')")
        el-switch(v-model='enable_federation')    
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
  }
}
</script>