<template lang="pug">
    nuxt-link.embed_event(:to='`/event/${link}`' target='_blank' :class='{ withImg: event.image_path }')

      //- image
      img.float-left(v-if='event.image_path' :src='`/media/thumb/${event.image_path}`')
      .event-info

        //-  title
        .date {{event|when('home')}}<br/>
        h4 {{event.title}}

        //- date / place
        .date {{event.place.name}}<br/> {{event.place.address}}

</template>
<script>
import { mapState } from 'vuex'
import Event from '../../components/Event'

export default {
  layout: 'iframe',
  components: { Event },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const [id, start_datetime] = params.event_id.split('_')
      const event = await $axios.$get(`/event/${id}`)
      event.start_datetime = start_datetime ? Number(start_datetime) : event.start_datetime
      return { event, id: Number(id) }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      loading: true
    }
  },
  computed: {
    ...mapState(['settings']),
    date () {
      return new Date(this.event.start_datetime).getDate()
    },
    link () {
      if (this.event.recurrent) {
        return `${this.event.id}_${this.event.start_datetime}`
      }
      return this.event.id
    }
  }
}

/**
 * <style>
.embedded_gancio {
  border: none;
  width: 450px;
  height: 220px;
  float: left;
}</style>
<iframe src='http://localhost:13120/embed/1' class='embedded_gancio'></iframe>
 */
</script>
<style lang='less'>
.embed_event {
  transition: margin .1s;
  background: url('/favicon.ico') no-repeat right 5px bottom 5px;
  background-size: 32px;
  background-color: #1f1f1f;

  display: inline-block;
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
    display: flex;
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
