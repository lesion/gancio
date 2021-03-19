<template lang='pug'>
div#list
  v-list(dense)
    v-list-item
      h3(v-if='title') {{title}}
    v-list-item(
      target='_blank'
      :to='`/event/${event.id}`'
      v-for='event in computedEvents'
      :key='`${event.id}_${event.start_datetime}`' small)
      v-list-item-content
        v-list-item-subtitle <v-icon small color='success' v-if='event.parentId'>mdi-repeat</v-icon> {{event|when}}
          span.primary--text.ml-1 @{{event.place.name}}
        v-list-item-title(v-text='event.title')
      //- a.text-body-1(:href='`/event/${event.id}`' target='_blank') {{event.title}}
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
    .v-list-item__title {
      white-space: normal !important;
    }
  }
</style>
