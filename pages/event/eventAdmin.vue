<template lang='pug'>
div
  v-divider {{$t('common.admin')}}

  v-menu.menu
    v-menu-item
      div(v-if='event.is_visible' @click='toggle(false)') <i class='el-icon-open'/> {{$t(`common.${event.parentId?'skip':'hide'}`)}}
      div(v-else @click='toggle(false)') <i class='el-icon-turn-off'/> {{$t('common.confirm')}}
    v-menu-item(@click='$router.push(`/add/${event.id}`)') <i class='el-icon-edit'/> {{$t('common.edit')}}
    v-menu-item(v-if='!event.parentId' @click='remove(false)') <i class='el-icon-delete'/> {{$t('common.remove')}}

    template(v-if='event.parentId')
      v-divider {{$t('event.recurrent')}}
      p.text-secondary
        i.el-icon-refresh
        small  {{event|recurrentDetail}}<br/>
      v-menu-item(v-if='event.parent.is_visible' @click='toggle(true)') <i class='el-icon-video-pause'/> {{$t('common.pause')}}
      v-menu-item(v-else @click='toggle(true)') <i class='el-icon-video-play'/> {{$t('common.start')}}
      v-menu-item(@click='$router.push(`/add/${event.parentId}`)') <i class='el-icon-edit'/> {{$t('common.edit')}}
      v-menu-item(@click='remove(true)') <i class='el-icon-delete'/> {{$t('common.remove')}}
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
        await MessageBox.confirm(this.$t(`event.remove_${parent ? 'recurrent_' : ''}confirmation`), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        const id = parent ? this.event.parentId : this.event.id
        await this.$axios.delete(`/event/${id}`)
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
