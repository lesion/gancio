<template lang="pug">
  .card.announcement.announcement.mt-1.text-white(body-style='padding: 0px;')
    nuxt-link(:to='`/announcement/${announcement.id}`')
      .title <i class='el-icon-info'/> {{announcement.title}}

    .card-body
      .description(v-html='description')

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
.announcement {
  .title i {
    color: orangered;
  }
  box-shadow: inset 0px 0px 10px 0px orangered;
}
</style>
