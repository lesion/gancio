<template lang='pug'>
  v-container
    v-card-title {{$t('common.events')}}
    v-card-subtitle {{$t('admin.event_confirm_description')}}
    v-card-text
      v-data-table(
        :hide-default-footer='unconfirmedEvents.length<10'
        :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
        :items='unconfirmedEvents'
        :headers='headers')
        template(v-slot:item.when='{ item }') {{item|when}}
        template(v-slot:item.actions='{ item }')
          v-btn(text small @click='confirm(item)' color='success') {{$t('common.confirm')}}
          v-btn(text small :to='`/event/${item.slug || item.id}`' color='success') {{$t('common.preview')}}
          v-btn(text small :to='`/add/${item.id}`' color='warning') {{$t('common.edit')}}
          v-btn(text small @click='remove(item)'
            color='error') {{$t('common.delete')}}

</template>
<script>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export default {
  props: {
    unconfirmedEvents: { type: Array, default: () => [] }
  },
  data () {
    return {
      mdiChevronLeft, mdiChevronRight,
      valid: false,
      dialog: false,
      editing: false,
      headers: [
        { value: 'title', text: 'Title' },
        { value: 'place.name', text: 'Place' },
        { value: 'when', text: 'When' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  methods: {
    edit (event) {
      this.$router.push(`/add/${event.id}`)
    },
    async confirm (event) {
      try {
        await this.$axios.$put(`/event/confirm/${event.id}`)
        this.$emit('confirmed', event.id)
        this.$root.$message('event.confirmed', { color: 'success' })
      } catch (e) {}
    },
    async remove (event) {
      const ret = await this.$root.$confirm('event.remove_confirmation')
      if (!ret) { return }
      await this.$axios.delete(`/event/${event.id}`)
      this.$root.$message('admin.event_remove_ok')
    }
  }
}
</script>
