<template lang="pug">
  span
    v-dialog(v-model='openMediaDetails' :fullscreen="$vuetify.breakpoint.xsOnly" width='1000px')
      v-card
        v-card-title {{$t('common.media')}}
        v-card-text
          v-row
            v-col(:span='4' :cols='4')
              p {{$t('event.choose_focal_point')}}
              v-img(v-if='mediaPreview'
                :src='mediaPreview'
                aspect-ratio='1.7778'
                :position="position")

              v-textarea.mt-4(type='text'
                label='Alternative text'
                persistent-hint
                @input='v => name=v'
                :value='value.name' filled
                :hint='$t("event.alt_text_description")')
              br
              v-card-actions.justify-space-between
                v-btn(text @click='openMediaDetails=false' color='warning') Cancel
                v-btn(text color='primary' @click='save') Save

            v-col(:span='8' :cols='8')
              v-img.cursorPointer(
                v-if='mediaPreview' :src='mediaPreview'
                @click='selectFocal')

    h3.mb-3.font-weight-regular(v-if='mediaPreview') {{$t('common.media')}}
    v-card-actions(v-if='mediaPreview')
      v-spacer
      v-btn(text color='primary' @click='openMediaDetails = true') {{$t('common.edit')}}
      v-btn(text color='error' @click='remove') {{$t('common.remove')}}
    div(v-if='mediaPreview')
      v-img.col-12.col-sm-2.ml-3(:src='mediaPreview' aspect-ratio='1.7778' :position='savedPosition')
      span.float-right {{event.media[0].name}}
    v-file-input(
      v-else
      :label="$t('common.media')"
      :hint="$t('event.media_description')"
      prepend-icon="mdi-camera"
      :value='value.image'
      @change="selectMedia"
      persistent-hint
      accept='image/*')
</template>
<script>
export default {
  name: 'MediaInput',
  props: {
    value: { type: Object, default: () => ({ image: null }) },
    event: { type: Object, default: () => {} }
  },
  data () {
    return {
      openMediaDetails: false,
      name: this.value.name || '',
      focalpoint: this.value.focalpoint || [0, 0]
    }
  },
  computed: {
    mediaPreview () {
      if (!this.value.url && !this.value.image) {
        return false
      }
      const url = this.value.image ? URL.createObjectURL(this.value.image) : /^https?:\/\//.test(this.value.url) ? this.value.url : `/media/thumb/${this.value.url}`
      return url
    },
    savedPosition () {
      const focalpoint = this.value.focalpoint || [0, 0]
      return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`
    },
    position () {
      const focalpoint = this.focalpoint || [0, 0]
      return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`
    }
  },
  methods: {
    save () {
      this.$emit('input', { url: this.value.url, image: this.value.image, name: this.name || this.value.image.name || '', focalpoint: [...this.focalpoint] })
      this.openMediaDetails = false
    },
    async remove () {
      const ret = await this.$root.$confirm('event.remove_media_confirmation')
      if (!ret) { return }
      this.$emit('remove')
    },
    selectMedia (v) {
      this.$emit('input', { image: v, name: v.name, focalpoint: [0, 0] })      
    },
    selectFocal (ev) {
      const boundingClientRect = ev.target.getBoundingClientRect()

      // get relative coordinate
      let x = Math.ceil(ev.clientX - boundingClientRect.left)
      let y = Math.ceil(ev.clientY - boundingClientRect.top)

      // snap to border
      x = x < 20 ? 0 : x > boundingClientRect.width - 20 ? boundingClientRect.width : x
      y = y < 20 ? 0 : y > boundingClientRect.height - 20 ? boundingClientRect.height : y

      // map to real image coordinate
      const posY = -1 + (y / boundingClientRect.height) * 2
      const posX = -1 + (x / boundingClientRect.width) * 2

      this.focalpoint = [posX, posY]
    }
  }
}
</script>
<style>
.cursorPointer {
  cursor: crosshair;
}

</style>
