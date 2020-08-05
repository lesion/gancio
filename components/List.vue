<template lang='pug'>
div#list
  p(v-if='title') {{title}}
  v-timeline(dense)
    v-timeline-item(
      v-for='event in events'
      :key='`${event.id}_${event.start_datetime}`')
      div {{event|when}}
      a(:href='`/event/${event.id}`' target='_blank') {{event.title}}
      small.float-right @{{event.place.name}}
</template>
<script>

export default {
  name: 'List',
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
      default: true
    },
    showImage: {
      type: Boolean,
      default: true
    },
    showDescription: {
      type: Boolean,
      default: true
    }
  }
}
</script>
<style lang='less'>
  #list {
    max-width: 500px;
    margin: 0 auto;
  }
</style>
