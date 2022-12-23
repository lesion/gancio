<template lang='pug'>
v-container
  v-card-title {{ $t('common.tags') }}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      :label="$t('common.search')"
      single-line hide-details)

  v-dialog(v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{$t('admin.edit_tag')}} -
        strong.ml-2 {{tag.tag}}
      v-card-subtitle {{$tc('admin.edit_tag_help', tag.count)}}
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
          v-combobox(v-model='newTag'
            :prepend-icon="mdiTag"
            hide-no-data
            persistent-hint
            :items="tags"
            :return-object='false'
            item-value='tag'
            item-text='tag'
            :label="$t('common.tags')")
              template(v-slot:item="{ item, on, attrs }")
                span "{{item.tag}}" <small>({{item.count}})</small>

      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.cancel') }}
        v-btn(@click='saveTag' color='primary' outlined :loading='loading'
          :disable='!valid || loading') {{ $t('common.save') }}

  v-card-text
    v-data-table(
      :headers='headers'
      :items='tags'
      :hide-default-footer='tags.length < 5'
      :header-props='{ sortIcon: mdiChevronDown }'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search')
      template(v-slot:item.map='{ item }')
        span {{item.latitude && item.longitude && 'YEP' }}
      template(v-slot:item.actions='{ item }')
        v-btn(@click='editTag(item)' color='primary' icon)
          v-icon(v-text='mdiPencil')
        nuxt-link(:to='`/tag/${item.tag}`')
          v-icon(v-text='mdiEye')
        v-btn(@click='removeTag(item)' color='primary' icon)
          v-icon(v-text='mdiDeleteForever')        

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown, mdiDeleteForever, mdiTag } from '@mdi/js'
import { mapState } from 'vuex'
import get from 'lodash/get'

export default {
  data() {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown, mdiDeleteForever, mdiTag,
      loading: false,
      dialog: false,
      valid: false,
      tag: {},
      newTag: '',
      tags: [],
      search: '',
      headers: [
        { value: 'tag', text: this.$t('common.tag') },
        { value: 'count', text: 'N.' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ]
    }
  },
  async fetch() {
    this.tags = await this.$axios.$get('/tags')
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    editTag(item) {
      this.tag.tag = item.tag
      this.tag.count = item.count
      this.dialog = true
    },
    async saveTag() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      this.$nextTick( async () => {
        await this.$axios.$put('/tag', { tag: this.tag.tag, newTag: this.newTag })
        await this.$fetch()
        this.newTag = ''
        this.loading = false
        this.dialog = false
      })
    },
    async removeTag(tag) {
      const ret = await this.$root.$confirm('admin.delete_tag_confirm', { tag: tag.tag, n: tag.count })
      if (!ret) { return }
      try {
        await this.$axios.$delete(`/tag/${encodeURIComponent(tag.tag)}`)
        await this.$fetch()
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    }    
  }
}
</script>
