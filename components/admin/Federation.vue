<template lang="pug">
  el-main
    el-switch.d-block(v-model='enable_federation' :active-text="$t('admin.enable_federation')")
    small.text-secondary {{$t('admin.enable_federation_help')}}

    template(v-if='enable_federation')

      el-switch.d-block.mt-4(v-model='enable_resources' :active-text="$t('admin.enable_resources')")
      small.text-secondary {{$t('admin.enable_resources_help')}}

      el-switch.d-block.mt-4(v-model='hide_boosts' :active-text="$t('admin.hide_boost_bookmark')")
      small.text-secondary {{$t('admin.hide_boost_bookmark_help')}}

      div.mt-4 {{$t('admin.instance_name')}}
      el-input(v-model='instance_name' placeholder='Instance name')
      small.d-block.text-secondary {{$t('admin.instance_name_help')}} (<u>@{{instance_name}}@{{settings.baseurl|url2host}}</u>)

      div.mt-4 {{$t('admin.trusted_instances')}}
      el-input(v-model='instance_url')
        el-button(slot='append' @click='createTrustedInstance') {{$t('common.send')}}

      el-table(:data='settings.trusted_instances')
        el-table-column(:label="$t('common.name')")
          template(slot-scope='data')
            span {{data.row.name}}
        el-table-column(:label="$t('common.url')")
          template(slot-scope='data')
            span {{data.row.url}}
        el-table-column(:label="$t('common.action')")
          template(slot-scope='data')
            el-button(size='mini'
              type='danger'
              @click='delete_instance(data.row)') {{$t('admin.delete_user')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Federation',
  data () {
    return {
      instance_url: ''
    }
  },
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
  methods: {
    ...mapActions(['setSetting']),
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
