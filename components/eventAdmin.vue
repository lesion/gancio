<template lang='pug'>
span
  v-list(dense nav)
    v-list-group(:append-icon='mdiChevronUp' :value='true')
      template(v-slot:activator)
        v-list-item.text-overline {{$t('common.admin_actions')}}

      //- Hide / confirm event
      v-list-item(@click='toggle(false)')
        v-list-item-icon
          v-icon(v-if='event.is_visible' v-text='mdiEyeOff')
          v-icon(v-else='event.is_visible' v-text='mdiEye')
        v-list-item-content
          v-list-item-title(v-text="$t(`common.${event.is_visible?'hide':'confirm'}`)")

      //- Edit event
      v-list-item(:to='`/add/${event.id}`')
        v-list-item-icon
          v-icon(v-text='mdiCalendarEdit')
        v-list-item-content
          v-list-item-title(v-text="$t('common.edit')")

      //- Remove
      v-list-item(@click='remove(false)')
        v-list-item-icon
          v-icon(v-text='mdiDelete')
        v-list-item-content
          v-list-item-title(v-text="$t('common.remove')")


      template(v-if='event.parentId')
        v-list-item.text-overline(v-html="$t('common.recurring_event_actions')")

        //- Pause / Start to generate recurring event
        v-list-item(@click='toggle(true)')
          v-list-item-icon
            v-icon(v-text='event.parent.is_visible ? mdiPause : mdiPlay')
          v-list-item-content
            v-list-item-title(v-text="$t(`common.${event.parent.is_visible ? 'pause': 'start'}`)")


        //- Edit event
        v-list-item(:to='`/add/${event.parentId}`')
          v-list-item-icon
            v-icon(v-text='mdiCalendarEdit')
          v-list-item-content
            v-list-item-title(v-text="$t('common.edit')")

        //- Remove
        v-list-item(@click='remove(true)')
          v-list-item-icon
            v-icon(v-text='mdiDeleteForever')
          v-list-item-content
            v-list-item-title(v-text="$t('common.remove')")


  //- v-btn(text color='primary' v-if='event.is_visible' @click='toggle(false)') {{$t(`common.${event.parentId?'skip':'hide'}`)}}
  //- v-btn(text color='success' v-else @click='toggle(false)') <v-icon color='yellow' v-text='mdiAlert'></v-icon> {{$t('common.confirm')}}
  //- v-btn(text color='primary' @click='$router.push(`/add/${event.id}`)') {{$t('common.edit')}}
  //- v-btn(text color='primary' v-if='!event.parentId' @click='remove(false)') {{$t('common.remove')}}

  //- template(v-if='event.parentId')
  //-   v-divider
  //-   span.mr-1 <v-icon v-text='mdiRepeat'></v-icon> {{$t('event.edit_recurrent')}}
  //-   v-btn(text color='primary' v-if='event.parent.is_visible' @click='toggle(true)') {{$t('common.pause')}}
  //-   v-btn(text color='primary' v-else @click='toggle(true)') {{$t('common.start')}}
  //-   v-btn(text color='primary' @click='$router.push(`/add/${event.parentId}`)') {{$t('common.edit')}}
  //-   v-btn(text color='primary' @click='remove(true)') {{$t('common.remove')}}
</template>
<script>
import { mdiChevronUp, mdiRepeat, mdiDelete, mdiCalendarEdit, mdiEyeOff, mdiEye, mdiPause, mdiPlay, mdiDeleteForever } from '@mdi/js'
export default {
  name: 'EventAdmin',
  data () {
    return { mdiChevronUp, mdiRepeat, mdiDelete, mdiCalendarEdit, mdiEyeOff, mdiEye, mdiPause, mdiPlay, mdiDeleteForever }
  },
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
