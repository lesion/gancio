<template lang="pug">
nuxt-link.embed_event(:to='`/event/${event.slug || event.id}`' target='_blank' :class='{ withImg: event.media }')

  //- image
  img.float-left(:src='$helper.mediaURL(event, "thumb")')
  .event-info
    //-  title
    .date {{$time.when(event)}}<br/>
    h4 {{event.title}}

    //- date / place
    .date {{event.place.name}}
</template>
<script>

export default {
  layout: 'iframe',
  async asyncData ({ $axios, params, error }) {
    try {
      const event = await $axios.$get(`/event/detail/${params.event_id}`)
      return { event }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      settings: { baseurl: '' },
      loading: true
    }
  }
}

// <iframe src='http://localhost:13120/embed/1' class='embedded_gancio'></iframe>
</script>
<style lang='scss'>
.embed_event {
  display: flex;
  transition: margin .1s;
  background: url('/logo.png') no-repeat right 5px bottom 5px;
  background-size: 32px;
  background-color: #1f1f1f;
  text-decoration: none;
  border: 1px solid #b1a3a3;
  margin: 0px auto;
  padding: 0px;
  width: 400px;
  height: 210px;
  overflow: hidden;
  border-radius: 10px;
  // transition: all .2s;
  margin: 0px;

  &:hover {
    transform: prospective(10) translateX(10);
    margin-left: 5px;
    text-decoration: none;
  }

  .event-info {
    height: 100%;
    color: #eee !important;
    flex-direction: column;
    padding: 5px;

    .date {
      color: #999;
    }
  }

  img {
    width: 150px;
    object-fit: cover;
    object-position: top;
    margin-right: 5px;
    height: 100%;
  }

}
</style>
