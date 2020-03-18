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
      el-input(v-model='instance_name' placeholder='Instance name' @blur='save("instance_name", instance_name)')
      small.d-block.text-secondary {{$t('admin.instance_name_help')}} (<u>@{{instance_name}}@{{settings.baseurl|url2host}}</u>)

    el-switch.d-block.mt-4(v-model='enable_trusted_instances' :active-text="$t('admin.enable_trusted_instances')")
    small.text-secondary {{$t('admin.trusted_instances_help')}}

    template(v-if='enable_trusted_instances')
      div.mt-4 {{$t('admin.instance_place')}}
        el-input(v-model='instance_place' @blur='save("instance_place", instance_place)')
        small.d-block.text-secondary {{$t('admin.instance_place_help')}}

      div.mt-4 {{$t('admin.add_trusted_instance')}}
        el-input(v-model='instance_url' :placeholder="$t('common.url')")
          el-button(slot='append' @click='createTrustedInstance') {{$t('common.send')}}

      el-table(:data='settings.trusted_instances')
        el-table-column(:label="$t('common.name')")
          template(slot-scope='data')
            span {{data.row.name}}
        el-table-column(:label="$t('common.url')")
          template(slot-scope='data')
            span {{data.row.url}}
        el-table-column(:label="$t('common.place')")
          template(slot-scope='data')
            span {{data.row.label}}
        el-table-column(:label="$t('common.actions')")
          template(slot-scope='data')
            el-button(size='mini'
              type='danger'
              @click='deleteInstance(data.row)') {{$t('admin.delete_user')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { Message } from 'element-ui'
import axios from 'axios'

export default {
  name: 'Federation',
  data ({ $store }) {
    return {
      instance_url: '',
      instance_name: $store.state.settings.instance_name,
      instance_place: $store.state.settings.instance_place
    }
  },
  computed: {
    ...mapState(['settings']),
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
    },
    enable_trusted_instances: {
      get () { return this.settings.enable_trusted_instances },
      set (value) { this.setSetting({ key: 'enable_trusted_instances', value }) }
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async createTrustedInstance () {
      try {
        const instance = await axios
          .get(`${this.instance_url}/.well-known/nodeinfo/2.1`)
        console.error(instance)
        this.setSetting({
          key: 'trusted_instances',
          value: this.settings.trusted_instances.concat({
            url: this.instance_url,
            name: instance.data.metadata.nodeName,
            label: instance.data.metadata.nodeLabel
          })
        })
        this.instance_url = ''
      } catch (e) {
        Message({
          showClose: true,
          type: 'error',
          message: e
        })
      }
    },
    async deleteInstance (instance) {
      await this.setSetting({
        key: 'trusted_instances',
        value: this.settings.trusted_instances.filter(i => i.url !== instance.url)
      })
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
