<template lang='pug'>
div
  el-divider {{$t('common.admin')}}
  el-menu.menu
    el-menu-item
      div(v-if='event.is_visible' @click='toggle(false)') <i class='el-icon-open'/> {{$t('common.hide')}}
      div(v-else @click='toggle(false)') <i class='el-icon-turn-off'/> {{$t('common.confirm')}}
    el-menu-item
      div(@click='remove(false)') <i class='el-icon-delete'/> {{$t('common.remove')}}
    el-menu-item(@click='$router.replace(`/add/${event.id}`)') <i class='el-icon-edit'/> {{$t('common.edit')}}
    div(v-if='event.parentId')
      el-divider  {{$t('event.recurrent')}}
      el-menu-item(v-if='event.parent.is_visible' @click='toggle(true)') <i class='el-icon-video-pause'/> {{$t('common.pause')}}
      el-menu-item(v-else @click='toggle(true)') <i class='el-icon-video-play'/> {{$t('common.start')}}
      el-menu-item(@click='remove(true)') <i class='el-icon-delete'/> {{$t('common.remove')}}
      el-menu-item(@click='$router.replace(`/add/${event.parentId}`)') <i class='el-icon-edit'/> {{$t('common.edit')}}
</template>
<script>
import { MessageBox } from 'element-ui'
import { mapActions } from 'vuex'

export default {
  name: 'EventAdmin',
  props: {
    event: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    ...mapActions(['delEvent']),
    async remove (parent = false) {
      try {
        await MessageBox.confirm(this.$t('event.remove_confirmation'), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        const id = parent ? this.event.parentId : this.event.id
        await this.$axios.delete(`/user/event/${id}`)
        this.delEvent(Number(id))
        this.$router.replace('/')
      } catch (e) {
        console.error(e)
      }
    },
    async toggle (parent = false) {
      const id = parent ? this.event.parentId : this.event.id
      const is_visible = parent ? this.event.parent.is_visible : this.event.is_visible
      const method = is_visible ? 'unconfirm' : 'confirm'
      try {
        await this.$axios.$get(`/event/${method}/${id}`)
        if (parent) {
          this.event.parent.is_visible = !is_visible
        } else {
          this.event.is_visible = !is_visible
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
