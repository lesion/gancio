<template>
  <div class='d-flex pa-4'>
    <v-btn icon large nuxt to='/'>
      <img src='/logo.png' height='40' />
    </v-btn>

    <v-spacer/>

    <div class='d-flex'>
      <v-btn icon large to='/about' :title='$t("common.about")' :aria-label='$t("common.about")'>
        <v-icon v-text='mdiInformation' />
      </v-btn>

      <client-only>
        <v-menu offset-y transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon large v-bind='attrs' v-on='on' aria-label='Language' v-text="$i18n.locale" />
          </template>
          <v-list dense>
            <v-list-item v-for='locale in $i18n.locales' @click.prevent.stop="$i18n.setLocale(locale.code)" :key='locale.code'>
              <v-list-item-content>
                <v-list-item-title v-text='locale.name' />
              </v-list-item-content>
            </v-list-item>
            <v-list-item nuxt target='_blank' href='https://hosted.weblate.org/engage/gancio/'>
              <v-list-item-content>
                  <v-list-item-subtitle v-text='$t("common.help_translate")' />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn slot='placeholder' large  icon arial-label='Language'>{{$i18n.locale}}</v-btn>
      </client-only> 

      <client-only>
        <v-menu v-if='$auth.loggedIn' offset-y transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn class='mr-0' large icon v-bind='attrs' v-on='on' title='Menu' aria-label='Menu'>
              <v-icon v-text='mdiDotsVertical' />
            </v-btn>
          </template>
          <v-list>
            <v-list-item nuxt to='/settings'>
              <v-list-item-icon><v-icon v-text='mdiCog'></v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="$t('common.settings')"/>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if='$auth.user.is_admin' nuxt to='/admin'>
              <v-list-item-icon>
                <v-icon v-text='mdiAccount' />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="$t('common.admin')" />
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click='logout'>
              <v-list-item-icon>
                <v-icon v-text='mdiLogout' />
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="$t('common.logout')" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <template #placeholder>
          <v-btn v-if='$auth.loggedIn' large icon aria-label='Menu' title='Menu'>
            <v-icon v-text='mdiDotsVertical' />
          </v-btn>
        </template>
      </client-only>

      <!-- login button -->
      <v-btn class='mr-0' v-if='!$auth.loggedIn' large icon nuxt  to='/login' :title='$t("common.login")' :aria-label='$t("common.login")'>
        <v-icon v-text='mdiLogin' />
      </v-btn>
    </div>
  </div>
</template>
<script>

import { mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiInformation } from '@mdi/js'

export default {
  data () {
    return { mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiInformation }
  },
  methods: {
    logout () {
      this.$root.$message('common.logout_ok')
      this.$auth.logout()
    }
  }  
}
</script>