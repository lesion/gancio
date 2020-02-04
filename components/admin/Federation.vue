<template lang="pug">
  div
    el-form(label-width='200px')
      el-form-item(:label="$t('admin.enable_federation')")
        el-popover(:content="$t('admin.enable_federation_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='enable_federation')

      el-form-item(v-show='enable_federation' :label="$t('admin.enable_resources')")
        el-popover(:content="$t('admin.enable_resources_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='enable_resources')

      el-form-item(v-show='enable_federation' :label="$t('admin.hide_boost_bookmark')")
        el-popover(:content="$t('admin.hide_boost_bookmark_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='hide_boosts')

      el-form-item(v-show='enable_federation' :label="$t('admin.instance_name')")
        el-popover(:content="$t('admin.instance_name_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-input.w-25(v-model='instance_name' placeholder='Instance name')
        p Follow this instance from <u>@{{instance_name}}@{{settings.baseurl|url2host}}</u>

</template>
<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Federation',
  computed: {
    ...mapState(['settings']),
    instance_name: {
      get () { return this.settings.instance_name },
      set (value) { this.setSetting({ key: 'instance_name', value }) }
    },
    enable_federation: {
      get () { return this.settings.enable_federation },
      set (value) { this.setSetting({ key: 'enable_federation', value }) }
    },
    enable_resources: {
      get () { return this.settings.enable_resources },
      set (value) { this.setSetting({ key: 'enable_resources', value }) }
    },
    hide_boosts: {
      get () { return this.settings.hide_boosts },
      set (value) { this.setSetting({ key: 'hide_boosts', value }) }
    }
  },
  methods: mapActions(['setSetting'])
}
</script>
