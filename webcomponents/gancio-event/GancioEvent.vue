<template lang='pug'>
  div.gancio-event
    h3 ciao {{event.title}}
    span {{event.place.name}}

</template>

<script>
export default {
  name: 'GancioEvent',
  props: {
    eventUrl: String
  },
  data () {
    return {
      event: { place: {} }
    }
  },
  mounted () {
    // qui dovrei fetchare event id
    fetch(this.eventUrl)
      .then(ret => ret.json())
      .then(event => {
        this.event=event
        console.error(event)
      })
      .catch(e => console.error(e))

  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.gancio-event {
  display: inline-block;
  width: 300px;
  border: 1px solid grey;
  background-color: black;
  color: white;
}
</style>
