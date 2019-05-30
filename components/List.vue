<template lang="pug">
div#list
  el-divider {{title}}
  el-timeline
    el-timeline-item(
      v-for='event in events'
      :key='event.id'
      :timestamp='event|event_when'
      placement='top' icon='el-icon-arrow-down' size='large'
    )

      div.float-right
        small @{{event.place.name}}

      a(:href='"/event/" + event.id' target='_blank') {{event.title}}
      hr
</template>
<script>
import { mapGetters } from 'vuex'
const { SHARED_CONF } = require('@/config')

export default {
  name: 'List',
  data () {
    return { SHARED_CONF }
  },
  props: {
    title: {
      type: String,
      default: SHARED_CONF.title
    },
    events: {
      type: Array,
      default: () => {
        return []
      }
    },
    maxEvents: {
      type: Number,
      default: 0
    },
    minimal: {
      type: Boolean,
      default: false
    },
    showTags: {
      type: Boolean,
      default: true,
    },
    showImage: {
      type: Boolean,
      default: true,
    },
    showDescription: {
      type: Boolean,
      default: true
    }
  },
}
</script>
<style lang='less'>
  #list {
    max-width: 500px;

    .el-timeline {
      padding-left: 5px;

      hr {
        margin-top: 4px;
        margin-bottom: 4px;
      }
    }

    .el-timeline-item {
      padding-bottom: 1px;
    }

    .el-timeline-item__timestamp {
      margin: 0px;
      padding: 0px;
    }
  }
</style>
