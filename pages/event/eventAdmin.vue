<template lang='pug'>
el-menu
  el-divider {{$t('common.admin')}}
  el-menu-item
    div(@click.prevents='toggle') {{$t(event.is_visible?'common.hide':'common.confirm')}}
  el-menu-item
    div(@click.prevent='remove') {{$t('common.remove')}}
  el-menu-item(@click='$router.replace(`/add/${event.id}`)') {{$t('common.edit')}}
</template>
<script>
import { MessageBox } from 'element-ui'

export default {
  name: 'EventAdmin',
  props: ['event'],
  methods: {
    async remove () {
      try {
        await MessageBox.confirm(this.$t('event.remove_confirmation'), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error' })
        await this.$axios.delete(`/user/event/${this.event.id}`)
        this.delEvent(Number(this.event.id))
        this.$router.replace('/')
      } catch (e) {
        console.error(e)
      }
    },
    async toggle () {
      try {
        if (this.event.is_visible) {
          await this.$axios.$get(`/event/unconfirm/${this.event.id}`)
          this.event.is_visible = false
        } else {
          await this.$axios.$get(`/event/confirm/${this.event.id}`)
          this.event.is_visible = true
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>