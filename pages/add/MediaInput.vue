<template lang="pug">
  span
    v-dialog(v-model='openMediaDetails' max-width='1000px')
      v-card
        v-card-title {{$t('common.media')}}
        v-card-text
          v-row
            v-col(:span='4' :cols='4')
              p Scegli il punto centrale cliccando
              v-img(v-if='mediaPreview'
                :src='mediaPreview'
                aspect-ratio='1.7778'
                :position="position")

              v-textarea.mt-4(type='text'
                label='Alternative text'
                persistent-hint
                @input='v => name=v'
                :value='value.name' filled
                hint='Descrizione per utenti con disabilita visive')
              v-card-actions.justify-space-between
                v-btn(@click='openMediaDetails=false' color='warning') Cancel
                v-btn(color='primary' @click='save') Save

            v-col(:span='8' :cols='8')
              v-img(
                v-if='mediaPreview' :src='mediaPreview'
                @click='selectFocal'
                max-width='88%')

    h3.mb-3.font-weight-regular(v-if='mediaPreview') {{$t('common.media')}}
    v-img.col-12.col-sm-2.ml-3(v-if='mediaPreview' :src='mediaPreview' aspect-ratio='1.7778' :position='position')
      v-btn-toggle
        v-btn(text color='primary' @click='openMediaDetails = true') {{$t('common.edit')}}
        v-btn(text color='primary' @click='remove') {{$t('common.remove')}}
      p {{event.media[0].name}}
    v-file-input(
      v-else
      :label="$t('common.media')"
      :hint="$t('event.media_description')"
      prepend-icon="mdi-camera"
      :value='value.image'
      @change="v => $emit('input', { image: v, focalpoint: [0, 0] })"
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
    console.error(this.value)
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
      const url = this.value.image ? URL.createObjectURL(this.value.image) : `/media/thumb/${this.value.url}`
      return url
    },
    position () {
      return `${(this.focalpoint[0] + 1) * 50}% ${(this.focalpoint[1] + 1) * 50}%`
    }
  },
  methods: {
    save () {
      this.$emit('input', { url: this.value.url, image: this.value.image, name: this.name, focalpoint: this.focalpoint })
      this.openMediaDetails = false
    },
    remove () {
      this.$emit('remove')
    },
    selectFocal (ev) {
      const boundingClientRect = ev.target.getBoundingClientRect()

      // get relative coordinate
      const x = Math.ceil(ev.clientX - boundingClientRect.left)
      const y = Math.ceil(ev.clientY - boundingClientRect.top)

      // map to real image coordinate
      const posY = -1 + (y / boundingClientRect.height) * 2
      const posX = -1 + (x / boundingClientRect.width) * 2

      this.focalpoint = [posX, posY]
    }
  }
}
</script>
