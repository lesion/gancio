<template lang='pug'>
div
  v-btn(text color='primary' v-if='event.is_visible' @click='toggle(false)') {{$t(`common.${event.parentId?'skip':'hide'}`)}}
  v-btn(text color='success' v-else @click='toggle(false)') <v-icon color='yellow'>mdi-alert</v-icon> {{$t('common.confirm')}}
  v-btn(text color='primary' @click='$router.push(`/add/${event.id}`)') {{$t('common.edit')}}
  v-btn(text color='primary' v-if='!event.parentId' @click='remove(false)') {{$t('common.remove')}}

  template(v-if='event.parentId')
    v-divider
    span.mr-1 <v-icon>mdi-repeat</v-icon> {{$t('event.edit_recurrent')}}
    v-btn(text color='primary' v-if='event.parent.is_visible' @click='toggle(true)') {{$t('common.pause')}}
    v-btn(text color='primary' v-else @click='toggle(true)') {{$t('common.start')}}
    v-btn(text color='primary' @click='$router.push(`/add/${event.parentId}`)') {{$t('common.edit')}}
    v-btn(text color='primary' @click='remove(true)') {{$t('common.remove')}}
</template>
<script>

export default {
  name: 'EventAdmin',
  props: {
    event: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    async remove (parent = false) {
      const ret = await this.$root.$confirm(`event.remove_${parent ? 'recurrent_' : ''}confirmation`)
      if (!ret) { return }
      const id = parent ? this.event.parentId : this.event.id
      await this.$axios.delete(`/event/${id}`)
      this.$router.replace('/')
    },
    async toggle (parent = false) {
      const id = parent ? this.event.parentId : this.event.id
      const is_visible = parent ? this.event.parent.is_visible : this.event.is_visible
      const method = is_visible ? 'unconfirm' : 'confirm'
      try {
        await this.$axios.$put(`/event/${method}/${id}`)
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
