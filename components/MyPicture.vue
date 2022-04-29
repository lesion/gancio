<template>
<figure :class='{ thumb, img: true }' 
    :height="height" :width="width"
    :style="backgroundPreview">

  <picture>
    <source :srcset="srcset" type='image/webp' />

    <img 
      v-if='media' 
      :class='{ "u-featured": true, loading }'
      :alt='media.name' :loading='lazy?"lazy":"eager"'
      :src="src"
      itemprop="image"
      :height="height" :width="width"
      :style="{ 'object-position': thumbnailPosition }"
      @load="loaded">

    <img v-else-if='!media && thumb' class='thumb' src="noimg.svg" alt=''>

  </picture>


</figure>
</template>
<script>

export default {
  props: {
    event:  { type: Object, default: () => ({}) },
    thumb: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
    showPreview: { type: Boolean, default: true }
  },
  data () {
    return { loading: true }
  },
  computed: {
    backgroundPreview () {
      if (this.media && this.media.preview) {
        return {
          backgroundPosition: this.thumbnailPosition,
          backgroundImage: "url('data:image/png;base64," + this.media.preview + "')" }
      }
    },
    media () {
      return this.event.media[0]
    },
    height () {
      return this.media ? this.media.height : 'auto'
    },
    width () {
      return this.media ? this.media.width : 'auto'
    },
    src () {
      if (this.media) {
        return '/media/' + (this.thumb ? 'thumb/' : '') + this.media.url
      }
      if (this.thumb) {
        return '/noimg.svg'
      }
    },
    srcset () {
      return this.src.replace(/.jpg$/, '.webp')
    },
    thumbnailPosition () {
      if (this.media.focalpoint) {
        const focalpoint = this.media.focalpoint
        return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`
      }
      return 'center center'
    },
  },
  methods: {
    loaded () {
      this.loading = false
    }
  }
}
</script>
<style>

.img {
  width: 100%;
  height: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  background-size: cover;
}

.img img {
  width: 100%;
  max-width: 100%;
  height: auto;
  overflow: hidden;
  transition: opacity 1s;
  opacity: 1;
  background-size: 100%;
}

.img.thumb img {
  display: flex;
  max-height: 250px;
  min-height: 160px;
  object-fit: cover;
  object-position: top;
  aspect-ratio: 1.7778;
}

.img picture {
  width: 100%;
  display: flex;
}

.img picture img.loading {
  opacity: 0;
}

</style>