<template>
<v-container class="pa-0">
  <v-card>
    <v-card-title>{{$t('common.my_events')}}</v-card-title>
    <v-card-text class="pa-1 pa-md-3">
      <v-text-field v-model="search" :label="$t('common.search')"/>
      <v-data-table :items="events"  :hide-default-footer='events.length<10' dense :search="search"
        :header-props='{ sortIcon: mdiChevronDown }'
        :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
        :headers='headers'>
        <template v-slot:item.data-table-select="{ isSelected, select }">
          <v-simple-checkbox size='small' small dense :on-icon="mdiCheckboxOutline" :off-icon="mdiCheckboxBlankOutline" :value="isSelected" @input="select($event)" />
        </template>
        <template v-slot:item.when='{ item }'>
          <span v-if='!item.recurrent'>{{$time.when(item)}}</span>
          <span v-else><v-icon color='success' v-text='mdiRepeat' /> {{$time.recurrentDetail({ parent: item }, 'EEEE, HH:mm')}}</span>
        </template>
        <template v-slot:item.actions='{ item }'>
          <template v-if="!item.recurrent">
            <t-btn @click='toggle(item)' v-if='!item.is_visible' color='success' :tooltip="$t('common.confirm')"><v-icon v-text='mdiEye' /></t-btn>
            <t-btn @click='toggle(item)' v-else-if="!item.parentId" color='info' :tooltip="$t('common.hide')"><v-icon v-text='mdiEyeOff' /></t-btn>
            <t-btn @click='toggle(item)' v-else color='info' :tooltip="$t('common.skip')"><v-icon v-text='mdiDebugStepOver' /></t-btn>
            <t-btn :to='`/event/${item.slug || item.id}`' :tooltip="$t('common.preview')"><v-icon v-text='mdiArrowRight' /></t-btn>
          </template>
          <template v-else>
            <t-btn @click='toggle(item)' v-if='!item.is_visible' color='success' :tooltip="$t('common.start')"><v-icon v-text='mdiPlay' /></t-btn>
            <t-btn @click='toggle(item)' v-else color='info' :tooltip="$t('common.pause')"><v-icon v-text='mdiPause' /></t-btn>                    
          </template>
          <t-btn :to='`/add/${item.id}`' color='yellow' :tooltip="$t('common.edit')"><v-icon v-text='mdiPencil' /></t-btn>
          <t-btn @click='remove(item, item.recurrent)' color='error' :tooltip="$t('common.delete')"> <v-icon v-text='item.recurrent ? mdiDeleteForever : mdiDelete' /></t-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</v-container>
</template>
<script>

import { mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiCheckboxOutline, mdiCheckboxBlankOutline,
  mdiPencil, mdiDelete, mdiArrowRight, mdiEye, mdiEyeOff, mdiRepeat, mdiPause, mdiPlay, mdiDebugStepOver, mdiDeleteForever } from '@mdi/js'
import { mapState } from 'vuex'
import TBtn from '../components/TBtn.vue'

export default {
  name: 'Settings',
  middleware: ['auth'],
  components: { TBtn },
  data () {
    return {
      mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiCheckboxOutline, mdiCheckboxBlankOutline,
      mdiPencil, mdiDelete, mdiArrowRight, mdiEye, mdiEyeOff, mdiRepeat, mdiPause, mdiPlay, mdiDebugStepOver, mdiDeleteForever,
      events: [],
      search: '',
      headers: [
        { value: 'title', text: this.$t('common.title') },
        { value: 'place.name', text: this.$t('common.place') },
        { value: 'when', text: this.$t('common.when') },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ]      
    }
  },
  computed: mapState(['settings']),
  async fetch () {
    this.events = await this.$axios.$get('/events/mine')
  },
  methods: {
    async toggle (event) {
      const id = event.id
      const is_visible = event.is_visible
      const method = is_visible ? 'unconfirm' : 'confirm'
      try {
        await this.$axios.$put(`/event/${method}/${id}`)
        event.is_visible = !is_visible
      } catch (e) {
        console.error(e)
      }
    },
    async remove (event, parent) {
      const ret = await this.$root.$confirm(`event.remove_${parent ? 'recurrent_' : ''}confirmation`)
      if (!ret) { return }
      await this.$axios.delete(`/event/${event.id}`)
      this.$fetch()
      this.$root.$message('admin.event_remove_ok')
    }    
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.my_events')}`
    }
  }
}
</script>
