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
      v-card-title {{ $t('admin.edit_tag') }}
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
          v-text-field(
            :rules="[$validators.required('common.name')]"
            :label="$t('common.tag')"
            v-model='tag.tag'
            :placeholder='$t("common.tag")')

      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.cancel') }}
        v-btn(@click='savePlace' color='primary' outlined :loading='loading'
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
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown, mdiDeleteForever } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

export default {
  data( {$store} ) {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown, mdiDeleteForever,
      loading: false,
      dialog: false,
      valid: false,
      tag: {},
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
      this.dialog = true
    },
    async saveTag() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      await this.$axios.$put('/tag', this.tag)
      await this.$fetch()
      this.loading = false
      this.dialog = false
    },
    async removeTag(tag) {
      const ret = await this.$root.$confirm('admin.delete_tag_confirm', { tag: tag.tag })
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
