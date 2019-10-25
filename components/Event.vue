<template lang="pug">
  nuxt-link.event(:to='`/event/${link}`' target='_blank' :class='{ withImg: event.image_path }')

    //- image
    img(v-if='showImage && event.image_path' :src='`/media/thumb/${event.image_path}`')

    .event-info
      .content-info

        //-  title
        h2 {{event.title}}

        //- date / place
        .date
          div <v-icon name='clock'/> {{event|when('home')}}
          div <v-icon name='map-marker-alt' /> {{event.place.name}}

      ul.tags(v-if='showTags && event.tags')
        li(v-for='tag in event.tags' :key='tag') {{tag}}
        li(v-if='settings.enable_federation && event.comments && event.comments.length') <u>{{$tc('common.comments', event.comments.length)}}</u>
</template>
<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    event: Object,
    showTags: {
      type: Boolean,
      default: true
    },
    showImage: {
      type: Boolean,
      default: true
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
</script>
<style lang='less'>
@import '../assets/style.less';

@media only screen and (min-width: 574px) {
  .event {
    height: 100%;
  }
}
.event {
  padding: 3px;
  display: flex;
  flex-direction: column;

  // height: 100%;

  &:hover {
    text-decoration: none;
  }

  img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
    object-position: top;
  }

  .event-info {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #111214;

  }

  .content-info {
    padding: 0.8em 1em;

    h2 {
      color: @success;
      font-size: 16px;
      font-size: 1.2rem;
      font-weight: 400;
      margin: 0px;
    }

    p {
      max-height: 92px;
      overflow: hidden;
      color: white;
      margin: 0px;
    }

    .date {
      font-weight: 400;
      font-size: 1rem;
      color: white;
    }
  }

  .tags {
    font-size: 15px;
    padding: 1px;
    margin-bottom: 0;
    display:flex;
    flex-wrap: wrap;
    justify-content: center;

    li {
      background: #1B1F21;
      display: inline-block;
      padding: 2px 10px;
      color: rgba(255,255,255,0.9);
      margin: 1px;
      text-align: center;
      flex-grow: 1;
    }

  }
}

</style>
