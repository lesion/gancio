<template lang="pug">
  el-container.announcement-page.text-white
    el-header.text-white
      h3 <i style='color: red' class='el-icon-info'/> {{announcement.title}}

    el-main
      pre.mt-4(v-html='announcement.announcement')

</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Announcement',
  data () {
    return { announcement: { title: '' } }
  },
  asyncData ({ $axios, params, error, store }) {
    try {
      const id = Number(params.id)
      const announcement = store.state.announcements.find(a => a.id === id)
      console.error(announcement)
      return { announcement }
    } catch (e) {
      error({ statusCode: 404, message: 'Announcement not found' })
    }
  },
  computed: mapState(['announcements']),
  methods: {
    showResource (resource) {
      this.showResources = true
      this.selectedResource = resource
      document.getElementById('resourceDialog').focus()
    }
  }
}
</script>
<style lang='less'>
.announcement-page {

  .el-header {
    height: auto !important;
    padding-top: 1em;
    border-bottom: 1px solid lightgray;
  }

  .title {
    max-width: 80%;
    max-height: 0.1rem;
    overflow: hidden;
    font-size: 1.6rem;
    line-height: 1;
    padding-right: 40px;
  }

  pre {
    white-space: pre-line;
    word-break: break-word;
    color: #aaa;
    font-size: 1.2em;
    font-family: inherit;
  }

}

@media only screen and (max-width: 768px) {
  #eventDetail {
    .title {
      font-size: 1em;
      font-weight: bold;
    }
  }
}
</style>
