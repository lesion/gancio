<template lang='pug'>
  v-container
    v-card-title {{$t('common.events')}}
    v-card-subtitle {{$t('admin.event_confirm_description')}}
    v-card-text
      v-data-table(
        :items='unconfirmedEvents'
        :headers='headers')
        template(v-slot:item.actions='{ item }')
          v-btn(text small @click.stop='toggle(item)'
            :color='item.visible?"warning":"success"') {{item.visible?$t('common.disable'):$t('common.enable')}}
          v-btn(text small @click='edit(item)') {{$t('common.edit')}}
          v-btn(text small @click='remove(item)'
            color='error') {{$t('common.delete')}}

</template>
<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: {
    unconfirmedEvents: { type: Array, default: () => [] }
  },
  data () {
    return {
      valid: false,
      dialog: false,
      editing: false,
      headers: [
        { value: 'title', text: 'Title' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  methods: {
    edit (event) {
      this.$router.push(`/add/${event.id}`)
    },
    async toggle (event) {
      try {
        event.is_visible = !event.is_visible
        await this.$axios.$put(`/event/${event.id}`, event)
        this.events = this.events.map(a => a.id === event.id ? event : a)
        this.setevents(cloneDeep(this.events.filter(a => a.visible)))
      } catch (e) {}
    },
    async remove (event) {
      const ret = await this.$root.$confirm(this.$t('common.confirm'),
        this.$t('event.remove_confirmation'))
      if (!ret) { return }
      await this.$axios.delete(`/event/${event.id}`)
      this.$root.$message({
        message: this.$t('admin.event_remove_ok')
      })
    }
  }
}
</script>
