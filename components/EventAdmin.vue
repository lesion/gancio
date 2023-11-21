<template lang='pug'>
span
  v-list(dense nav color='transparent')
    v-list-group(:append-icon='mdiChevronUp' :value='true')
      template(v-slot:activator)
        v-list-item.text-overline {{$t('common.admin_actions')}}

      //- Hide / confirm event
      v-list-item(@click='toggle(false)')
        v-list-item-icon
          v-icon(v-if='event.is_visible' v-text='mdiEyeOff')
          v-icon(v-else='event.is_visible' v-text='mdiEye')
        v-list-item-content
          v-list-item-title(v-text="$t(`common.${event.is_visible?(event.parentId?'skip':'hide'):'confirm'}`)")

      //- Edit event
      v-list-item(:to='`/add/${event.id}`')
        v-list-item-icon
          v-icon(v-text='mdiCalendarEdit')
        v-list-item-content
          v-list-item-title(v-text="$t('common.edit')")

      //- Clone
      v-list-item(v-if='!event.parentId' :to='`/add/${event.id}?clone=true`')
        v-list-item-icon
          v-icon(v-text='mdiScanner')
        v-list-item-content
          v-list-item-title(v-text="$t('common.clone')")

      //- Contact user
      v-list-item(v-if='event.userId && event.userId !== $auth.user.id && settings.allow_message_users' @click='openContactUser = true')
        v-list-item-icon
          v-icon(v-text='mdiMessageTextOutline')
        v-list-item-content
          v-list-item-title(v-text="$t('common.contact_user')")


      //- Remove
      v-list-item(v-if='!event.parentId' @click='remove(false)')
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

  v-dialog(v-model='openContactUser' :fullscreen="$vuetify.breakpoint.xsOnly" width='1000px')
    v-card
      v-card-title {{$t('common.contact_user')}}
      v-card-text
        v-textarea(type='text'
          @input='v => message=v'
          :value='value.message'
          label='Message')
        br
        v-card-actions.justify-space-between
          v-btn(text @click='openContactUser=false' color='warning') Cancel
          v-btn(text color='primary' @click='sendMessageToUser') Send

</template>
<script>
import { mdiChevronUp, mdiRepeat, mdiDelete, mdiCalendarEdit, mdiEyeOff, mdiEye, mdiPause, mdiPlay, mdiDeleteForever, mdiScanner, mdiMessageTextOutline } from '@mdi/js'
import { mapState } from 'vuex'
export default {
  name: 'EventAdmin',
  data () {
    return {
      mdiChevronUp, mdiRepeat, mdiDelete, mdiCalendarEdit, mdiEyeOff, mdiEye, mdiPause, mdiPlay, mdiDeleteForever, mdiScanner,  mdiMessageTextOutline,
      openContactUser: false,
      message: this.value.message || ''
    }
  },
  props: {
    event: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    },
    
  },
  computed: {
    ...mapState(['settings'])
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
    },
    async sendMessageToUser () {
      try {
	await this.$axios.$post('/user/send_message', {
	  subject: this.event.title,
	  message: this.message,
	  userId: this.event.userId
	})
      } catch (e) {
	console.error(e)
      }
    }
  }
}
</script>
