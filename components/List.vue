<template lang='pug'>
div#list
  p(v-if='title') {{title}}
  v-timeline(dense)
    v-timeline-item(
      v-for='event in computedEvents'
      :key='`${event.id}_${event.start_datetime}`')
      .text-subtitle {{event|when}}
        .text-subtitle.float-right @{{event.place.name}}
      a.text-h5(:href='`/event/${event.id}`' target='_blank') {{event.title}}
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
  },
  computed: {
    computedEvents () {
      if (!this.maxEvents) { return this.events }
      return this.events.slice(0, this.maxEvents)
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
