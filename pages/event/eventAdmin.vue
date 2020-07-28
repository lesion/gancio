<template lang='pug'>
div
  v-btn(text color='primary' v-if='event.is_visible' @click='toggle(false)') {{$t(`common.${event.parentId?'skip':'hide'}`)}}
  v-btn(text color='primary' v-else @click='toggle(false)') {{$t('common.confirm')}}
  v-btn(text color='primary' @click='$router.push(`/add/${event.id}`)') {{$t('common.edit')}}
  v-btn(text color='primary' v-if='!event.parentId' @click='remove(false)') {{$t('common.remove')}}

  template(v-if='event.parentId')
    v-divider {{$t('event.recurrent')}}
    p.text-secondary
      i.el-icon-refresh
      small  {{event|recurrentDetail}}
    v-btn(text color='primary' v-if='event.parent.is_visible' @click='toggle(true)') {{$t('common.pause')}}
    v-btn(text color='primary' v-else @click='toggle(true)') {{$t('common.start')}}
    v-btn(text color='primary' @click='$router.push(`/add/${event.parentId}`)') {{$t('common.edit')}}
    v-btn(text color='primary' @click='remove(true)') {{$t('common.remove')}}
</template>
<script>
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
      const ret = await this.$root.$confirm(this.$t(`event.remove_${parent ? 'recurrent_' : ''}confirmation`), this.$t('common.confirm'), {
        type: 'error'
      })
      if (!ret) { return }
      const id = parent ? this.event.parentId : this.event.id
      await this.$axios.delete(`/event/${id}`)
      this.delEvent(Number(id))
      this.$router.replace('/')
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
