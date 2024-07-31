<template lang="pug">
v-container.container.pa-0.pa-md-3
  v-card
    v-card-title
      h4 {{ edit ? $t('common.edit_event') : $t('common.add_event') }}
      v-spacer
      v-btn(outlined  color='primary' @click='openImportDialog = true')
        <v-icon v-text='mdiFileImport'></v-icon> {{ $t('common.import') }}
    v-dialog(v-model='openImportDialog' :fullscreen='$vuetify.breakpoint.xsOnly')
      ImportDialog(@close='openImportDialog = false' @imported='eventImported')

    v-card-text.px-0.px-xs-2
      v-form(v-model='valid' ref='form' lazy-validation)
        v-container
          v-row
            //- Not logged event
            v-col(v-if='!$auth.loggedIn' cols=12)
              p(v-html="$t('event.anon_description')")

            //- Title
            v-col(cols=12)
              v-text-field(
                @change='v => event.title = v'
                :value = 'event.title'
                :rules="[$validators.required('common.title')]"
                :prepend-icon='mdiFormatTitle'
                :label="$t('common.title')"
                autofocus
                ref='title')

            //- Where
            v-col(cols=12)
              WhereInput(ref='where' v-model='event.place' :event='event')

            //- When
            DateInput(ref='when' v-model='date' :event='event')

            //- Description
            v-col.px-0(cols='12')
              Editor.px-3.ma-0(
                :label="$t('event.description_description')"
                v-model='event.description'
                :placeholder="$t('event.description_description')"
                max-height='400px')

            //- MEDIA / FLYER / POSTER
            v-col(cols=12 md=6)
              MediaInput(v-model='event.media[0]' :event='event' @remove='event.media = []')

            //- TAGS
            v-col(cols=12 md=6)
              v-combobox(:value='event.tags'
                :prepend-icon="mdiTagMultiple"
                chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
                cache-items
                @change='updateTags'
                @input.native='searchTags'
                :delimiters="[',', ';']"
                :items="tags"
                :menu-props="{ maxWidth: 400, eager: true }"
                :label="$t('common.tags')")
                template(v-slot:selection="{ item, on, attrs, selected, parent }")
                  v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                    :input-value="selected" label small) {{ item }}

    <v-card-actions>
      <v-spacer />
      <v-btn @click='done' :loading='loading' :disabled='!valid || loading' outlined color='primary'>{{ edit ? $t('common.save') : $t('common.send') }}</v-btn>
    </v-card-actions>

</template>
<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'

import { mdiFileImport, mdiFormatTitle, mdiTagMultiple, mdiCloseCircle } from '@mdi/js'

import Editor from '@/components/Editor'
import ImportDialog from '@/components/ImportDialog'
import MediaInput from '@/components/MediaInput'
import WhereInput from '@/components/WhereInput'
import DateInput from '@/components/DateInput'

export default {
  name: 'NewEvent',
  components: {
    Editor,
    ImportDialog,
    MediaInput,
    WhereInput,
    DateInput
  },
  validate({ store, params, error }) {
    // should we allow anon event?
    if(!store.state.settings.allow_anon_event && !store.state.auth.loggedIn) {
      return error({ statusCode: 401, message: 'Not allowed'})
    }

    // do not allow edit to anon users
    if (params.edit && !store.state.auth.loggedIn) {
      return error({ statusCode: 401, message: 'Not allowed'})
    }

    return true

  },
  async asyncData({ query, params, $axios, error, $auth, $time, store }) {
    if (params.edit) {

      const data = { event: { place: {}, media: [] } }
      data.id = params.edit
      data.edit = query.clone ? false : true 
      let event
      try {
        event = await $axios.$get('/event/detail/' + data.id)
        if (!$auth.user.is_editor && !$auth.user.is_admin && !event.isMine) {
          error({ statusCode: 401, message: 'Not allowed' })
          return {}
        }
      } catch (e) {
        error({ statusCode: 404, message: 'Event not found!' })
        return {}
      }

      data.event.place.name = event.place.name
      data.event.place.address = event.place.address || ''
      const from = $time.fromUnix(event.start_datetime)
      const due = event.end_datetime && $time.fromUnix(event.end_datetime)
      data.date = {
        recurrent: event.recurrent,
        from: from.toJSDate(),
        due: due && due.toJSDate(),
        multidate: event.multidate,
        fromHour: from.toFormat('HH:mm'),
        dueHour: due && (due.toFormat('HH:mm') === '23:59' ? null : due.toFormat('HH:mm'))
      }

      data.event.title = event.title
      data.event.description = event.description
      if (data.edit) {
        data.event.id = event.id
      }
      data.event.tags = event.tags
      if (event.media && event.media.length > 0 && !data.edit) {
        event.media[0].url = `${store.state.settings.baseurl}/media/${event.media[0].url}`
      }
      data.event.media = event.media || []
      data.event.parentId = event.parentId
      data.event.recurrent = event.recurrent
      data.event.online_locations = event.online_locations
      return data
    }
    return {}
  },
  data({ $time }) {
    const month = $time.currentMonth()
    const year = $time.currentYear()
    return {
      mdiFileImport, mdiFormatTitle, mdiTagMultiple, mdiCloseCircle,
      valid: false,
      openImportDialog: false,
      event: {
        place: { name: '', address: '', latitude: null, longitude: null },
        title: '',
        description: '',
        tags: [],
        media: []
      },
      tags: [],
      page: { month, year },
      id: null,
      date: { from: null, due: null, recurrent: null },
      edit: false,
      loading: false,
      disableAddress: false
    }
  },
  head() {
    return {
      title: `${this.settings.title} - ${this.$t('common.add_event')}`
    }
  },
  computed: mapState(['settings']),
  methods: {
    updateTags (tags) {
      this.event.tags = uniqBy(tags.map(t => t.trim()), t => t.toLocaleLowerCase()).filter(t => t)
    },
    searchTags: debounce(async function (ev) {
      const search = ev.target.value
      if (!search) return
      this.tags = await this.$axios.$get(`/tag?search=${search}`)
    }, 200),
    eventImported(event) {
      this.event = Object.assign(this.event, event)

      this.$refs.where.selectPlace({ name: event.place.name || event.place, address: event.place.address })
      const from = this.$time.fromUnix(this.event.start_datetime)
      const due = this.event.end_datetime && this.$time.fromUnix(this.event.end_datetime)
      this.date = {
        recurrent: this.event.recurrent || null,
        from: from.toJSDate(),
        due: due && due.toJSDate(),
        multidate: event.multidate,
        fromHour: from.toFormat('HH:mm'),
        dueHour: due && due.toFormat('HH:mm')
      }
      this.openImportDialog = false
    },
    async done() {
      if (!this.$refs.form.validate()) {
        this.$nextTick(() => {
          const el = document.querySelector('.v-input.error--text:first-of-type')
          if (el) {
            el.scrollIntoView(false)
          }
        })
        return
      }
      this.loading = true

      const formData = new FormData()

      formData.append('recurrent', JSON.stringify(this.date.recurrent))

      if (this.event.media.length) {
        formData.append('image', this.event.media[0].image)
        if (this.event.media[0].url) {
          formData.append('image_url', this.event.media[0].url)
        }
        formData.append('image_name', this.event.media[0].name)
        formData.append('image_focalpoint', this.event.media[0].focalpoint)
      }

      formData.append('title', this.event.title)
      if (this.event.place.id) {
        formData.append('place_id', this.event.place.id)
      }
      formData.append('place_name', this.event.place.name.trim())
      formData.append('place_address', this.event.place.address || null)

      if (this.settings.allow_geolocation) {
        formData.append('place_latitude', this.event.place.latitude || '')
        formData.append('place_longitude', this.event.place.longitude || '')
      }

      if (this.event.online_locations) {
        this.event.online_locations.forEach(l => formData.append('online_locations[]', l))
      }

      formData.append('description', this.event.description)
      formData.append('multidate', !!this.date.multidate)
      formData.append('start_datetime', this.$time.fromDateInput(this.date.from, this.date.fromHour))
      if (!!this.date.multidate) {
        formData.append('end_datetime', this.$time.fromDateInput(this.date.due, this.date.dueHour || '23:59'))
      } else if (this.date.dueHour) {
        formData.append('end_datetime', this.$time.fromDateInput(this.date.due, this.date.dueHour))
      }

      if (this.edit) {
        formData.append('id', this.event.id)
      }
      if (this.event.tags) { this.event.tags.forEach(tag => formData.append('tags[]', tag.tag || tag)) }
      try {
        const ret = this.edit ? await this.$axios.$put('/event', formData) : await this.$axios.$post('/event', formData)
        if (!this.date.recurrent && (ret.is_visible || this.$auth.loggedIn)) {
          this.$router.push(`/event/${ret.slug}`)
        } else {
          this.$router.push('/')
        }
        this.$nextTick(() => {
          this.$root.$message(this.$auth.loggedIn ? (this.edit ? 'event.saved' : 'event.added') : 'event.added_anon', { color: 'success' })
        })
      } catch (e) {
        switch (e.request.status) {
          case 413:
            this.$root.$message('event.image_too_big', { color: 'error' })
            break
          default:
            this.$root.$message(e.response ? e.response.data : e, { color: 'error' })
        }
        this.loading = false
      }
    }
  }
}
</script>
