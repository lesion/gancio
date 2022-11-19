<template>
  <v-app-bar shrink-on-scroll  promiment app src="/headerimage.png">
    <template v-slot:img="{ props }">
      <v-img
        v-bind="props"
        :gradient="gradient"></v-img>
      </template>

      <v-app-bar-nav-icon to='/'>
        <img src='/logo.png' height='40' />
      </v-app-bar-nav-icon>

      <!-- <v-text-field name='search' :label='$t("common.search")' dense outlined rounded hide-details :append-icon='mdiMagnify'/> -->

      <v-list-item class='align-self-end' two-line>
        <v-list-item-content>
          <h4 v-text='settings.title'></h4>
          <v-list-item-subtitle v-text='settings.description'></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>


      <client-only>
        <v-menu offset-y transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind='attrs' v-on='on' aria-label='Language' v-text="$i18n.locale" />
          </template>
          <v-list>
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
        <v-btn slot='placeholder' icon arial-label='Language'>{{$i18n.locale}}</v-btn>
      </client-only> 

      <client-only>
        <v-menu v-if='loggedIn' offset-y transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn class='mr-0' icon v-bind='attrs' v-on='on' title='Menu' aria-label='Menu'>
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
          <v-btn v-if='loggedIn' icon aria-label='Menu' title='Menu'>
            <v-icon v-text='mdiDotsVertical' />
          </v-btn>
        </template>
      </client-only>

      <!-- login button -->
      <v-btn class='mr-0' v-if='!loggedIn' icon nuxt  to='/login' :title='$t("common.login")' :aria-label='$t("common.login")'>
        <v-icon v-text='mdiLogin' />
      </v-btn>

      <!-- <nuxt-link v-if='loggedIn || settings.allow_anon_event' link text nuxt to='/add' :aria-label='$t("common.add_event")' :title='$t("common.add_event")'>
        <v-icon large  v-text='mdiPlus' />
        <small v-text="$t('common.add_event')" />
      </nuxt-link> -->

<!-- //-   v-btn(icon nuxt to='/export' :title='$t("common.share")' :aria-label='$t("common.share")')
//-     v-icon(v-text='mdiShareVariant')

//-   v-btn(v-if='!loggedIn' icon nuxt to='/login' :title='$t("common.login")' :aria-label='$t("common.login")')
//-     v-icon(v-text='mdiLogin')



//-   client-only
//-     v-menu(offset-y transition="slide-y-transition" min-width='200px' max-height='400px')
//-       template(v-slot:activator="{ on, attrs }")
//-         v-btn(icon v-bind='attrs' v-on='on' aria-label='Language') {{$i18n.locale}}
//-       v-list
//-         v-list-item(v-for='locale in $i18n.locales' @click.prevent.stop="$i18n.setLocale(locale.code)" :key='locale.code')
//-           v-list-item-content
//-             v-list-item-title {{locale.name}}
//-         v-list-item(nuxt target='_blank' href='https://hosted.weblate.org/engage/gancio/')
//-           v-list-item-content
//-             v-list-item-subtitle(v-text='$t("common.help_translate")')
//-     template(#placeholder)
//-       v-btn(icon aria-label='Language') {{$i18n.locale}}

//-   v-btn(icon target='_blank' :href='`${settings.baseurl}/feed/rss`' title='RSS' aria-label='RSS')
//-     v-icon(color='orange' v-text='mdiRss')       -->
<!-- 
      <v-menu left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
      </v-menu> -->
<!-- .v-application--is-ltr .v-tabs--align-with-title > .v-tabs-bar:not(.v-tabs-bar--show-arrows):not(.v-slide-group--is-overflowing) > .v-slide-group__wrapper > .v-tabs-bar__content > .v-tab:first-child,
     .v-application--is-ltr .v-tabs--align-with-title > .v-tabs-bar:not(.v-tabs-bar--show-arrows):not(.v-slide-group--is-overflowing) > .v-slide-group__wrapper > .v-tabs-bar__content > .v-tabs-slider-wrapper + .v-tab -->
      <template v-slot:extension>
      <v-tabs v-model='tab' optional dense icons-and-text>
        <v-tab to='/'>
          <span class='d-none d-sm-flex'>Home</span>
          <v-icon v-text='mdiHome' />
        </v-tab>
        <v-tab v-if='loggedIn || settings.allow_anon_event' to='/add'>
          <span class='d-none d-sm-flex'>{{$t('common.add_event')}}</span>
          <v-icon color='primary' v-text='mdiPlus' />
        </v-tab>
        <v-tab to='/export' >
          <span class='d-none d-sm-flex'>{{$t('common.share')}}</span>
          <v-icon v-text='mdiShareVariant' />
        </v-tab>
        <v-tab to='/about'>
          <span class='d-none d-sm-flex'>About</span>
          <v-icon v-text='mdiInformation' />
        </v-tab>
      </v-tabs>
      </template>

    </v-app-bar>

<!-- //- v-app-bar(app aria-label='Menu' height=64)
//-   //- logo, title and description
//-   v-list-item(:to='$route.name==="index"?"/about":"/"')
//-     v-list-item-avatar.ma-xs-1(tile)
//-       img(src='/logo.png' height='40')
//-     v-list-item-content
//-       v-list-item-title.d-flex
//-         h2 {{settings.title}}
//-       v-list-item-subtitle.d-none.d-sm-flex {{settings.description}}

//-   v-spacer
//-   v-btn(v-if='loggedIn || settings.allow_anon_event' icon nuxt to='/add' :aria-label='$t("common.add_event")' :title='$t("common.add_event")')
//-     v-icon(large color='primary' v-text='mdiPlus')

//-   v-btn(icon nuxt to='/export' :title='$t("common.share")' :aria-label='$t("common.share")')
//-     v-icon(v-text='mdiShareVariant')

//-   v-btn(v-if='!loggedIn' icon nuxt to='/login' :title='$t("common.login")' :aria-label='$t("common.login")')
//-     v-icon(v-text='mdiLogin')

//-   client-only
//-     v-menu(v-if='loggedIn' offset-y transition="slide-y-transition")
//-       template(v-slot:activator="{ on, attrs }")
//-         v-btn(icon v-bind='attrs' v-on='on' title='Menu' aria-label='Menu')
//-           v-icon(v-text='mdiDotsVertical')
//-       v-list
//-         v-list-item(nuxt to='/settings')
//-           v-list-item-icon
//-             v-icon(v-text='mdiCog')
//-           v-list-item-content
//-             v-list-item-title {{$t('common.settings')}}

//-         v-list-item(v-if='$auth.user.is_admin' nuxt to='/admin')
//-           v-list-item-icon
//-             v-icon(v-text='mdiAccount')
//-           v-list-item-content
//-             v-list-item-title {{$t('common.admin')}}

//-         v-list-item(@click='logout')
//-           v-list-item-icon
//-             v-icon(v-text='mdiLogout')
//-           v-list-item-content
//-             v-list-item-title {{$t('common.logout')}}
//-     template(#placeholder)
//-       v-btn(v-if='loggedIn' icon aria-label='Menu' title='Menu')
//-         v-icon(v-text='mdiDotsVertical')

//-   client-only
//-     v-menu(offset-y transition="slide-y-transition" min-width='200px' max-height='400px')
//-       template(v-slot:activator="{ on, attrs }")
//-         v-btn(icon v-bind='attrs' v-on='on' aria-label='Language') {{$i18n.locale}}
//-       v-list
//-         v-list-item(v-for='locale in $i18n.locales' @click.prevent.stop="$i18n.setLocale(locale.code)" :key='locale.code')
//-           v-list-item-content
//-             v-list-item-title {{locale.name}}
//-         v-list-item(nuxt target='_blank' href='https://hosted.weblate.org/engage/gancio/')
//-           v-list-item-content
//-             v-list-item-subtitle(v-text='$t("common.help_translate")')
//-     template(#placeholder)
//-       v-btn(icon aria-label='Language') {{$i18n.locale}}

//-   v-btn(icon target='_blank' :href='`${settings.baseurl}/feed/rss`' title='RSS' aria-label='RSS')
//-     v-icon(color='orange' v-text='mdiRss') -->

</template>
<script>
const locales = require('../locales/index')
import { mapState } from 'vuex'
import clipboard from '../assets/clipboard'
import { mdiPlus, mdiShareVariant, mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiRss, mdiHome, mdiInformation } from '@mdi/js'


export default {
  name: 'Appbar',
  data () {
    return { mdiPlus, mdiShareVariant, mdiLogout, mdiLogin, mdiDotsVertical, mdiAccount, mdiCog, mdiRss, mdiHome, mdiInformation, locales, tab: '' }
  },
  mixins: [clipboard],
  computed: {
    loggedIn () {
      return this.$auth.loggedIn
    },
    gradient () {
      if (this.$vuetify.theme.dark) {
        return 'to bottom, rgba(59,0,0,.9), rgba(0,0,0,.9)'
      } else {
        return 'to bottom, rgba(255,230,230,.95), rgba(250,250,250,.95)'
      }
    },
    ...mapState(['settings']),
  },
  methods: {
    logout () {
      this.$root.$message('common.logout_ok')
      this.$auth.logout()
    }
  }
}
</script>
