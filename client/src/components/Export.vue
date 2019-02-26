<template lang="pug">
  b-modal(hide-footer hide-header
    @hide='$router.go(-1)' size='lg' :visible='true' v-if='type')
    h3.text-center Export {{type}}
    b-input-group.mb-2(v-if='showLink')
      b-form-input( v-model='link' autocomplete='off')
      b-input-group-append
        b-button(variant="success" v-clipboard:copy="link") <v-icon name='clipboard'/> Copy 
    p {{$t('export_intro')}}
    p(v-html='$t(`export_${type}_explanation`)')
    li(v-if='filters.tags.length') {{$t('Tags')}} ->
      b-badge.ml-1(v-for='tag in filters.tags') {{tag}}
    li(v-if='filters.places.length') {{$t('Places')}}
      b-badge.ml-1(v-for='place in filters.places') {{place}}
    b-form(v-if="type==='email'")
      el-switch(v-model='mail.sendOnInsert' :active-text="$t('notify_on_insert')")
      br
      el-switch(v-model='mail.reminder' :active-text="$t('send_reminder')") 
      b-form-input.mt-1(v-model='mail.mail' :placeholder="$t('Insert your address')")
      b-button.mt-1.float-right(variant='success' @click='activate_email') {{$t('Send')}}
</template>
<script>
import { mapState } from 'vuex'
import config from '../../config'
import path from 'path'

export default {
  name: 'Export',
  data () {
    return {
      type: '',
      link: '',
      mail: {}
    }
  },
  mounted () {
    this.type = this.$route.params.type
    this.link = this.loadLink()
    if (this.type === 'email' && this.logged) {
      this.mail.mail = this.user.email
    }
  },
  methods: {
    activate_email () {
      this.$router.go(-1)
    },
    loadLink () {
      const filters = this.filters.tags.join(',')
      return `${config.apiurl}/export/${this.type}/${filters}`
    }
  },
  computed: {
    ...mapState(['filters', 'user', 'logged']),
    showLink () {
      return (['feed', 'ics'].indexOf(this.type)>-1)
    },
  }
}
</script>

