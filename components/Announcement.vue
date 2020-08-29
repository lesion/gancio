<template lang="pug">
  nuxt-link(:to='`/announcement/${announcement.id}`')
    v-alert.mb-0(border='left' type='info' color="primary" show-icon) {{announcement.title}}

</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    announcement: { type: Object, default: () => ({}) }
  },
  computed: {
    ...mapState(['announcements']),
    description () {
      return this.announcement.announcement.replace(/(<br>)+/g, '<br>')
    }
  }
}
</script>
<style lang='less'>
// .announcement {
//   padding: 2%;
//   background-color: #511;
//   margin: 1rem 0;
//   border-radius: 5px;
//   a:hover {
//     text-decoration: none;
//   }
//   .title {
//     font-size: 1.2em;
//     color: white;
//     transition: color .2s;
//     &:hover {
//       color: #fbd6b5;
//     }
//   }
//   border: 2px solid #ff4500ba;
//   // box-shadow: inset 0px 0px 10px 0px orangered;
// }
</style>
