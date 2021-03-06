import Vue from 'vue'
// https://fontawesome.com/icons?d=gallery
//
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/user'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/tools'
import 'vue-awesome/icons/file-export'
import 'vue-awesome/icons/sign-out-alt'
import 'vue-awesome/icons/clock'
import 'vue-awesome/icons/map-marker-alt'
import 'vue-awesome/icons/file-alt'
import 'vue-awesome/icons/image'
import 'vue-awesome/icons/tag'
import 'vue-awesome/icons/users'
import 'vue-awesome/icons/calendar'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/envelope-open-text'
import 'vue-awesome/icons/user-secret'
import 'vue-awesome/icons/question-circle'
import 'vue-awesome/icons/share'
import 'vue-awesome/icons/comment'
import 'vue-awesome/icons/comments'
import 'vue-awesome/icons/tags'
import 'vue-awesome/icons/chevron-right'
import 'vue-awesome/icons/chevron-left'
import 'vue-awesome/icons/search'
import 'vue-awesome/icons/times'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/calendar-day'
import 'vue-awesome/icons/calendar-week'
import 'vue-awesome/icons/calendar-alt'
import 'vue-awesome/icons/network-wired'
import 'vue-awesome/icons/rss'

import Icon from 'vue-awesome/components/Icon'

import VueClipboard from 'vue-clipboard2'

export default () => {
  Vue.component('v-icon', Icon)
  Vue.use(VueClipboard)
}
