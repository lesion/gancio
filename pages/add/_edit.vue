<template lang="pug">
  v-container.container.pa-0.pa-md-3
    v-card
      v-card-title
        h4 {{edit?$t('common.edit_event'):$t('common.add_event')}}
        v-spacer
        v-btn(link text color='primary' @click='openImportDialog=true')
          <v-icon v-text='mdiFileImport'></v-icon> {{$t('common.import')}}
      v-dialog(v-model='openImportDialog' :fullscreen='$vuetify.breakpoint.xsOnly')
        ImportDialog(@close='openImportDialog=false' @imported='eventImported')

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
                WhereInput(ref='where' v-model='event.place')

              //- When
              DateInput(v-model='date' :event='event')
              //- Description
              v-col.px-0(cols='12')
                Editor.px-3.ma-0(
                  :label="$t('event.description_description')"
                  v-model='event.description'
                  :placeholder="$t('event.description_description')"
                  max-height='400px')

              //- MEDIA / FLYER / POSTER
              v-col(cols=12 md=6)
                MediaInput(v-model='event.media[0]' :event='event' @remove='event.media=[]')

              //- tags
              v-col(cols=12 md=6)
                v-combobox(v-model='event.tags'
                  :prepend-icon="mdiTagMultiple"
                  chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
                  :delimiters="[',', ';']"
                  :items="tags.map(t => t.tag)"
                  :label="$t('common.tags')")
                  template(v-slot:selection="{ item, on, attrs, selected, parent}")
                    v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                      :input-value="selected" label small) {{item}}
        </v-chip>

      v-card-actions
        v-spacer
        v-btn(@click='done' :loading='loading' :disabled='!valid || loading'
          color='primary') {{edit?$t('common.save'):$t('common.send')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import dayjs from 'dayjs'

import { mdiFileImport, mdiFormatTitle, mdiTagMultiple, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'NewEvent',
  components: {
    List: () => import(/* webpackChunkName: "add" */'@/components/List'),
    Editor: () => import(/* webpackChunkName: "add" */'@/components/Editor'), 
    ImportDialog: () => import(/* webpackChunkName: "add" */'./ImportDialog.vue'),
    MediaInput: () => import(/* webpackChunkName: "add" */'./MediaInput.vue'),
    WhereInput: () => import(/* webpackChunkName: "add" */'./WhereInput.vue'),
    DateInput: () => import(/* webpackChunkName: "add" */'./DateInput.vue')
  },
  validate ({ store }) {
    return (store.state.auth.loggedIn || store.state.settings.allow_anon_event)
  },
  async asyncData ({ params, $axios, error, store }) {
    if (params.edit) {
      const data = { event: { place: {}, media: [] } }
      data.id = params.edit
      data.edit = true
      let event
      try {
        event = await $axios.$get('/event/' + data.id)
      } catch (e) {
        error({ statusCode: 404, message: 'Event not found!' })
        return {}
      }

      data.event.place.name = event.place.name
      data.event.place.address = event.place.address || ''
      data.date = {
        recurrent: event.recurrent,
        from: new Date(dayjs.unix(event.start_datetime)),
        due: new Date(dayjs.unix(event.end_datetime)),
        multidate: event.multidate,
        fromHour: true,
        dueHour: true
      }

      data.event.title = event.title
      data.event.description = event.description
      data.event.id = event.id
      data.event.tags = event.tags
      data.event.media = event.media || []
      return data
    }
    return {}
  },
  data () {
    const month = dayjs().month() + 1
    const year = dayjs().year()
    return {
      mdiFileImport, mdiFormatTitle, mdiTagMultiple, mdiCloseCircle,
      valid: false,
      openImportDialog: false,
      event: {
        place: { name: '', address: '' },
        title: '',
        description: '',
        tags: [],
        media: []
      },
      page: { month, year },
      fileList: [],
      id: null,
      date: { from: null, due: null, recurrent: null },
      edit: false,
      loading: false,
      disableAddress: false
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.add_event')}`
    }
  },
  computed: mapState(['tags', 'places', 'settings']),
  methods: {
    ...mapActions(['updateMeta']),
    eventImported (event) {
      this.event = Object.assign(this.event, event)
      this.$refs.where.selectPlace({ name: event.place.name, create: true })
      this.date = {
        recurrent: this.event.recurrent || null,
        from: new Date(dayjs.unix(this.event.start_datetime)),
        due: new Date(dayjs.unix(this.event.end_datetime)),
        multidate: event.multidate,
        fromHour: true,
        dueHour: true
      }
      this.openImportDialog = false
    },
    async done () {
      if (!this.$refs.form.validate()) {
        this.$nextTick(() => {
          const el = document.querySelector('.v-input.error--text:first-of-type')
          el.scrollIntoView()
        })
        return
      }
      this.loading = true

      const formData = new FormData()

      formData.append('recurrent', JSON.stringify(this.date.recurrent))

      if (this.event.media.length) {
        formData.append('image', this.event.media[0].image)
        formData.append('image_url', this.event.media[0].url)
        formData.append('image_name', this.event.media[0].name)
        formData.append('image_focalpoint', this.event.media[0].focalpoint)
      }

      formData.append('title', this.event.title)
      formData.append('place_name', this.event.place.name)
      formData.append('place_address', this.event.place.address)
      formData.append('description', this.event.description)
      formData.append('multidate', !!this.date.multidate)
      formData.append('start_datetime', dayjs(this.date.from).unix())
      formData.append('end_datetime', this.date.due ? dayjs(this.date.due).unix() : this.date.from.add(2, 'hour').unix())

      if (this.edit) {
        formData.append('id', this.event.id)
      }
      if (this.event.tags) { this.event.tags.forEach(tag => formData.append('tags[]', tag.tag || tag)) }
      try {
        if (this.edit) {
          await this.$axios.$put('/event', formData)
        } else {
          await this.$axios.$post('/event', formData)
        }
        this.updateMeta()
        this.$router.push('/')
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
