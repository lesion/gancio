<template lang='pug'>
  div
    p(v-html="$t('admin.announcement_description')")
    br
    el-input(v-model='announcement.title' :placeholder='$t("common.title")')
    Editor.mt-2(v-model='announcement.announcement' border no-save style='max-height: 400px;')
    el-button.mt-2.float-right(@click='save' type='success' plain) {{$t(`common.${editing?'save':'send'}`)}}

    el-table(:data='announcements' small)
      el-table-column(:label="$t('common.title')" width='250')
        template(slot-scope='data')
          span(slot='reference') {{data.row.title}}

      el-table-column(:label="$t('common.actions')")
        template(slot-scope='data')
          el-button-group
            el-button(size='mini' type='primary'
              @click='edit(data.row)') {{$t('common.edit')}}
            el-button(size='mini'
              :type='data.row.visible?"warning":"success"'
              @click='toggle(data.row)') {{data.row.visible?$t('common.deactivate'):$t('common.activate')}}
            el-button(size='mini' type='danger'
              @click='remove(data.row)') {{$t('common.delete')}}

</template>
<script>
import { Message, MessageBox } from 'element-ui'
import { mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import Editor from '../Editor'
import Announcement from '../Announcement'

export default {
  components: { Editor, Announcement },
  data () {
    return {
      editing: false,
      announcements: [],
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
      MessageBox.confirm(this.$t('admin.delete_announcement_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        .then(() => this.$axios.delete(`/announcements/${announcement.id}`))
        .then(() => {
          Message({
            showClose: true,
            type: 'success',
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
