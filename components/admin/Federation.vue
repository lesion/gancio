<template lang="pug">
  div
    el-form(inline label-width='200px')
      el-form-item(:label="$t('admin.enable_federation')")
        el-switch(v-model='enable_federation')
        el-popover(:content="$t('admin.enable_federation_help')" trigger='hover')
          span.ml-1(slot='reference')
            i.el-icon-info

      el-form-item(v-show='enable_federation' :label="$t('admin.enable_comments')")
        el-switch(v-model='enable_comments')
        el-popover(:content="$t('admin.enable_comments_help')" trigger='hover')
          span.ml-1(slot='reference')
            i.el-icon-info

      el-form-item(v-show='enable_federation' :label="$t('admin.disable_gamification')")
        el-switch(v-model='disable_gamification')
        el-popover(:content="$t('admin.disable_gamification_help')" trigger='hover')
          span.ml-1(slot='reference')
            i.el-icon-info


      el-divider(v-if='enable_federation') {{$t('common.instances')}}
      el-table(v-if='enable_federation' :data='paginatedInstances' small)
        el-table-column(label='Domain' width='250')
          template(slot-scope='data')
            span(slot='reference') <img class='instance_thumb' :src="data.row.data.thumbnail"/> {{data.row.domain}}
        el-table-column(label='Name' width='150')
          template(slot-scope='data')
            span(slot='reference') {{data.row.name}}
        el-table-column(label='Users' width='150')
          template(slot-scope='data')
            span(slot='reference') {{data.row.users}}
        el-table-column(:label="$t('common.actions')" width='200')
          template(slot-scope='data')
            el-button-group
              el-button(size='mini'
                :type='data.row.blocked?"danger":"warning"'
                @click='toggleBlock(data.row)') {{data.row.blocked?$t('admin.unblock_instance'):$t('admin.block_instance')}}

      client-only
        el-pagination(v-if='enable_federation && instances.length>perPage' :page-size='perPage' :currentPage.sync='instancePage' :total='instances.length')

</template>
<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Federation',
  props: ['instances'],
  data () {
    return {
      perPage: 10,
      instancePage: 1
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async toggleBlock (instance) {
      await this.$axios.post('/instances/toggle_block', { instance: instance.domain, blocked: !instance.blocked })
      instance.blocked = !instance.blocked
    }
  },
  computed: {
    ...mapState(['settings']),
    paginatedInstances () {
      return this.instances.slice((this.instancePage - 1) * this.perPage,
        this.instancePage * this.perPage)
    },
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
    }
  }
}
</script>
<style lang="less">
.instance_thumb {
  height: 20px;
}
</style>