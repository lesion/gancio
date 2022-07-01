<template lang='pug'>
v-container
  v-card-title {{$t('common.announcements')}}
  v-card-subtitle(v-html="$t('admin.announcement_description')")
  v-dialog(v-model='dialog' width='800px' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{$t('admin.new_announcement')}}
      v-card-text.px-0
        v-form(v-model='valid' ref='announcement' @submit.prevent='save' lazy-validation)
          v-text-field.col-12(v-model='announcement.title'
            :rules="[$validators.required('common.title')]"
            :label='$t("common.title")')
          Editor.col-12(v-model='announcement.announcement'
            border no-save max-height='400px' :placeholder="$t('common.description')")
      v-card-actions
        v-spacer
        v-btn(@click='dialog=false' color='error') {{$t('common.cancel')}}
        v-btn(@click='save' color='primary' :disabled='!valid || loading' :loading='loading') {{$t(`common.${editing?'save':'send'}`)}}

  v-btn(@click='openDialog' text color='primary') <v-icon v-text='mdiPlus'></v-icon> {{$t('common.add')}}
  v-card-text
    v-data-table(
        v-if='announcements.length'
        :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
        :headers='headers'
        :items='announcements')
      template(v-slot:item.actions='{ item }')
        v-btn(text small @click.stop='toggle(item)'
          :color='item.visible?"warning":"success"') {{item.visible?$t('common.disable'):$t('common.enable')}}
        v-btn(text small @click='edit(item)' color='primary') {{$t('common.edit')}}
        v-btn(text small @click='remove(item)' color='error') {{$t('common.delete')}}
</template>
<script>
import { mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import Editor from '../Editor'
import Announcement from '../Announcement'
import { mdiPlus, mdiChevronRight, mdiChevronLeft } from '@mdi/js'

export default {
  components: { Editor, Announcement },
  data () {
    return {
      mdiPlus, mdiChevronRight, mdiChevronLeft,
      valid: false,
      dialog: false,
      editing: false,
      announcements: [],
      loading: false,
      headers: [
        { value: 'title', text: 'Title' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ],
      announcement: { title: '', announcement: '' }
    }
  },
  async mounted () {
    this.announcements = await this.$axios.$get('/announcements')
  },
  methods: {
    ...mapActions(['setAnnouncements']),
    edit (announcement) {
      this.announcement.title = announcement.title
      this.announcement.announcement = announcement.announcement
      this.announcement.id = announcement.id
      this.editing = true
      this.dialog = true
    },
    openDialog () {
      this.announcement = { title: '', announcement: '' }
      this.dialog = true
      this.$nextTick(() => this.$refs.announcement.reset())
    },
    async toggle (announcement) {
      try {
        announcement.visible = !announcement.visible
        await this.$axios.$put(`/announcements/${announcement.id}`, announcement)
        this.announcements = this.announcements.map(a => a.id === announcement.id ? announcement : a)
        this.setAnnouncements(cloneDeep(this.announcements.filter(a => a.visible)))
      } catch (e) {}
    },
    async remove (announcement) {
      const ret = await this.$root.$confirm('admin.delete_announcement_confirm')
      if (!ret) { return }
      this.$axios.delete(`/announcements/${announcement.id}`)
        .then(() => {
          this.$root.$message('admin.announcement_remove_ok')
          this.announcements = this.announcements.filter(a => a.id !== announcement.id)
        })
    },
    async save () {
      if (!this.$refs.announcement.validate()) { return }
      this.loading = true
      try {
        let announcement = null
        if (this.editing) {
          announcement = await this.$axios.$put(`/announcements/${this.announcement.id}`, this.announcement)
          this.announcements = this.announcements.map(a => a.id === announcement.id ? announcement : a)
        } else {
          announcement = await this.$axios.$post('/announcements', this.announcement)
          this.announcements = this.announcements.concat(announcement)
        }
        this.setAnnouncements(cloneDeep(this.announcements))
        this.announcement = { title: '', announcement: '' }
        this.$refs.announcement.reset()
        this.editing = false
        this.dialog = false
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    }
  }
}
</script>
