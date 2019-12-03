<template lang="pug">
  div
    el-form(label-width='200px')
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

      el-form-item(v-show='enable_federation' :label="$t('admin.hide_boost_bookmark')")
        el-switch(v-model='disable_gamification')
        el-popover(:content="$t('admin.hide_boost_bookmark_help')" trigger='hover')
          span.ml-1(slot='reference')
            i.el-icon-info

      el-row(v-if='enable_federation')
        el-col(:span='12')
          el-divider {{$t('common.instances')}}
          el-table(:data='paginatedInstances' small @row-click='instanceSelected')
            el-table-column(label='Domain' width='200')
              template(slot-scope='data')
                span(slot='reference') <img class='instance_thumb' :src="data.row.data.thumbnail"/> {{data.row.domain}}
            el-table-column(label='Name' width='100')
              template(slot-scope='data')
                span(slot='reference') {{data.row.name}}
            el-table-column(label='Users' width='70')
              template(slot-scope='data')
                span(slot='reference') {{data.row.users}}
            el-table-column(:label="$t('common.actions')" width='100')
              template(slot-scope='data')
                el-button-group
                  el-button(size='mini'
                    :type='data.row.blocked?"danger":"warning"'
                    @click='toggleBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}
          client-only
            el-pagination(v-if='enable_federation && instances.length>perPage' :page-size='perPage' :currentPage.sync='instancePage' :total='instances.length')

        el-col(:span='12')
          el-divider {{$t('common.users')}}
          el-table(:data='paginatedSelectedUsers' small)
            el-table-column(label='User' width='200')
              template(slot-scope='data')
                span(slot='reference') <img v-if='data.row.object.icon' class='instance_thumb' :src="data.row.object.icon.url"/>
                  a(:href='data.row.object.id' target='_blank') {{data.row.object.name}}
            el-table-column(:label="$t('admin.comments')" width='70')
              template(slot-scope='data')
                span {{data.row.comments.length}}
            el-table-column(:label="$t('common.actions')" width='200')
              template(slot-scope='data')
                el-button-group
                  el-button(size='mini'
                    :type='data.row.blocked?"danger":"warning"'
                    @click='toggleUserBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}

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
      instancePage: 1,
      userPage: 1,
      selectedInstance: null,
      users: [],
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async instanceSelected (instance) {
      this.users = await this.$axios.$get(`/instances/${instance.domain}`)
    },
    async toggleBlock (instance) {
      await this.$axios.post('/instances/toggle_block', { instance: instance.domain, blocked: !instance.blocked })
      instance.blocked = !instance.blocked
    },
    async toggleUserBlock (user) {
      await this.$axios.post('/instances/toggle_user_block', { user_id: user.ap_id })
      user.blocked = !user.blocked
    }
  },
  computed: {
    ...mapState(['settings']),
    paginatedInstances () {
      return this.instances.slice((this.instancePage - 1) * this.perPage,
        this.instancePage * this.perPage)
    },
    paginatedSelectedUsers () {
      return this.users.slice((this.userPage - 1) * this.perPage,
        this.userPage * this.perPage)
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