<template lang='pug'>
  v-container
    v-card-title {{$t('common.announcements')}}
    v-card-subtitle(v-html="$t('admin.announcement_description')")
    v-dialog(v-model='dialog' width='800')
      v-card
        v-card-title {{$t('admin.new_announcement')}}
        v-card-text
          v-form(v-model='valid')
            v-text-field(v-model='announcement.title' :placeholder='$t("common.title")')
            Editor.mt-2(v-model='announcement.announcement' border no-save style='max-height: 400px;')
        v-card-actions
          v-spacer
          v-btn(@click='save' color='primary') {{$t(`common.${editing?'save':'send'}`)}}

    v-card-actions
      v-spacer
      v-btn(@click='dialog=true' text color='primary') {{$t('common.add')}}
    v-card-text
      v-data-table(
          :headers='headers'
          :items='announcements')
        template(v-slot:item.actions='{ item }')
          v-btn(text small @click.stop='toggle(item)'
            :color='item.visible?"warning":"success"') {{item.visible?$t('common.deactivate'):$t('common.activate')}}
          v-btn(text small @click='edit(item)') {{$t('common.edit')}}
          v-btn(text small @click='remove(item)'
            color='error') {{$t('common.delete')}}

</template>
<script>
import { mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import Editor from '../Editor'
import Announcement from '../Announcement'

export default {
  components: { Editor, Announcement },
  data () {
    return {
      valid: false,
      dialog: false,
      editing: false,
      announcements: [],
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
      this.dialog = true
    },
    async toggle (announcement) {
      try {
        announcement.visible = !announcement.visible
        await this.$axios.$put(`/announcements/${announcement.id}`, announcement)
        this.announcements = this.announcements.map(a => a.id === announcement.id ? announcement : a)
        this.setAnnouncements(cloneDeep(this.announcements.filter(a => a.visible)))
      } catch (e) {}
    },
    remove (announcement) {
      this.$root.$confirm(this.$t('admin.delete_announcement_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        .then(() => this.$axios.delete(`/announcements/${announcement.id}`))
        .then(() => {
          this.$root.$message({
            message: this.$t('admin.announcement_remove_ok')
          })
          this.announcements = this.announcements.filter(a => a.id !== announcement.id)
        })
    },
    async save () {
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
        this.editing = false
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
