<template lang="pug">
div#list
  el-divider {{title}}
  el-timeline
    el-timeline-item(
      v-for='event in events'
      :key='event.id'
      :timestamp='event|when'
      placement='top' icon='el-icon-arrow-down' size='large'
    )

      div.float-right
        small @{{event.place.name}}

      a(:href='"/event/" + link(event)' target='_blank') {{event.title}}
      hr
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'List',
  data () {
    return { }
  },
  methods: {
    link (event) {
      if (event.recurrent) {
        return `${event.id}_${event.start_datetime/1000}`
      }
      return event.id
    }
  },
  props: {
    title: {
      type: String,
      default: ''
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
    margin: 0 auto;

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
