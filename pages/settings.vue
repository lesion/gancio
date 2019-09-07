<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)
    h5 {{$t('common.settings')}}
    hr

    el-form(action='/api/user' method='PUT' @submit.native.prevent='change_password' inline label-width='200px')

      el-form-item(:label="$t('settings.change_password')")
        el-input(v-model='password' type='password')
          el-button(slot='append' type='success' native-type='submit') {{$t('common.send')}}

      //- allow federation
      div(v-if='settings.enable_federation')
        el-form-item(:label="$t('admin.enable_federation')")
          el-switch(name='reg' v-model='enable_federation')
        
        el-form-item(v-if='enable_federation' :label="$t('common.username')")
          el-input(type='text' name='username' v-model='user.username' :suffix='"antani"' :readonly='user.username.length>0')
            template(slot='suffix') @{{baseurl}}
            //- el-button(slot='append') {{$t('common.save')}}


    
    el-divider {{$t('settings.danger_section')}}
    p {{$t('settings.remove_account')}}
    el-button(type='danger' @click='remove_account') {{$t('common.remove')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      enable_federation: false,
      password: '',
    }
  },
  name: 'Settings',
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.settings')}`
    }
  },
  async asyncData ({ $axios, params }) {
    const user = await $axios.$get('/auth/user')
    user.mastodon_auth = ''
    return { user }
  },
  computed: {
    ...mapState(['settings']),
    baseurl () {
      return new URL(this.settings.baseurl).host
    }
  },
  methods: {
    async change_password () {
      if (!this.password) return
      const user_data = { id : this.$auth.user.id, password: this.password }
      try {
        const user = await this.$axios.$put('/user', user_data)
        Message({ message: this.$t('settings.password_updated'), showClose: true, type: 'success' })
        this.$router.replace('/')
      } catch (e) {
        console.log(e)
      }
    },
    async remove_account () {
      MessageBox.confirm(this.$t('settings.remove_account_confirm'), this.$t('common.confirm'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'error'
      }).then( () => {
        this.$axios.$delete('/user')
        this.$auth.logout()
        this.$router.replace('/')
      })
    }
  }
}
</script>

