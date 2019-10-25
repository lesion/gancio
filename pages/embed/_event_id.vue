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

      //- ul.tags(v-if='event.tags')
      //-   li(v-for='tag in event.tags' :key='tag') {{tag}}
      //-   li(v-if='settings.enable_federation && event.comments && event.comments.length') <u>{{$tc('common.comments', event.comments.length)}}</u>
</template>
<script>
import { mapState } from 'vuex'
import Event from '../../components/Event'
import moment from 'dayjs'
import get from 'lodash/get'

export default {
  layout: 'event_iframe',
  components: { Event },
  data: {
   loading: true
  },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const [ id, start_datetime ] = params.event_id.split('_')
      const event = await $axios.$get(`/event/${id}`)
      console.error(event.tags)
      event.start_datetime = start_datetime ? Number(start_datetime) : event.start_datetime
      event.end_datetime = event.end_datetime
      return { event, id: Number(id) }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
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
a {
  transition: margin .1s;
}

a:hover {
  transform: prospective(10) translateX(10);
  margin-left: 15px;
}

.embed_event {
  background-image: url('/favicon.ico');
  background-repeat: no-repeat;
  background-position-x: right;
  background-position-y: bottom;
  img {
    width: 150px;
    object-fit: cover;
    object-position: top;
    margin-right: 5px;
    height: 100%;
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
}

// .embed_event:hover {
  // transform: scale(1.03);
// }
</style>