<template lang='pug'>
  v-container
    v-card-title {{$t('common.events')}}
    v-card-subtitle {{$t('admin.event_confirm_description')}}
    v-card-text
      v-data-table(
        :items='unconfirmedEvents'
        :headers='headers')
        template(v-slot:item.actions='{ item }')
          v-btn(text small @click='confirm(item)' color='success') {{$t('common.confirm')}}
          v-btn(text small :to='`/event/${item.id}`' color='success') {{$t('common.preview')}}
          v-btn(text small :to='`/add/${item.id}`' color='warning') {{$t('common.edit')}}
          v-btn(text small @click='remove(item)'
            color='error') {{$t('common.delete')}}

</template>
<script>

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
    async confirm (event) {
      try {
        await this.$axios.$put(`/event/confirm/${event.id}`)
        this.$emit('confirmed', event.id)
        this.$root.$message('event.confirmed')
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
