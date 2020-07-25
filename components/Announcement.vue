<template lang="pug">
  v-alert(border='left' dismissible color="deep-orange accent-2" dark close-text='antani') {{announcement.title}}
  //- v-list-item(link nuxt :to='`/announcement/${announcement.id}`')
  //-   v-list-item-icon
  //-     v-icon mdi-alert
  //-   v-list-item-content
  //-     v-list-item-title
  //-       h2 {{announcement.title}}
  //-     v-list-item-subtitle(v-html='announcement.announcement')

  //- v-list-item
  //-   v-btn(nuxt :to='`/announcement/${announcement.id}`') {{announcement.title}}
  //- .announcement.announcement.text-white(body-style='padding: 0px;')
    nuxt-link(:to='`/announcement/${announcement.id}`')
      .title <i class='el-icon-info'/> {{announcement.title}}

    //- .card-body
    //-   .description(v-html='description')

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
