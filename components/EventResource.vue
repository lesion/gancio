<template lang='pug'>
#resources.mt-1(v-if='settings.enable_federation')
    div.mb-3(v-if='!settings.hide_boosts && (event.boost?.length || event.likes?.length)')
        client-only
            v-menu(open-on-hover top offset-y v-if='event.likes.length')
                template( v-slot:activator="{ on, attrs }")
                    span.mr-3(v-bind='attrs' v-on='on') <v-icon color='primary' v-text='mdiStar' /> {{event.likes.length}}
                v-list
                    v-list-item(v-for='(like, idx) in event.likes' :key='idx')
                        v-list-item-title(v-text='like')

            v-menu(open-on-hover top offset-y v-if='event.boost.length')
                template( v-slot:activator="{ on, attrs }")
                    span(v-bind='attrs' v-on='on') <v-icon v-text='mdiShareAll' /> {{event.boost.length}}
                v-list
                    v-list-item(v-for='(boost, idx) in event.boost' :key='idx')
                        v-list-item-title(v-text='boost')
            template(slot='placeholder')
                span.mr-3 <v-icon color='primary' v-text='mdiStar' /> {{event.likes.length}}
                span <v-icon v-text='mdiShareAll' /> {{event.boost.length}}

    v-dialog(v-model='showResources' max-width="900" width="900" :fullscreen='$vuetify.breakpoint.xsOnly' destroy-on-close)
        v-card
            v-btn.ma-2(icon dark @click='showResources = false')
                v-icon(v-text='mdiClose')
            v-carousel.pa-5(:interval='10000'
                :next-icon='mdiArrowRight'
                :prev-icon='mdiArrowLeft'
                ref='carousel' hide-delimiters v-model='currentAttachment'
                height='100%' show-arrows-on-over)
                v-carousel-item(v-for='attachment in selectedResource.data.attachment' v-if='isImg(attachment)' :key='attachment.url')
                    v-img(:src='attachment.url' contain max-height='90%')
            v-card-actions.align-center.justify-center
                span {{currentAttachmentLabel}}

    v-card.mb-3.resources(v-if='settings.enable_resources' v-for='resource in event.resources' :key='resource.id' outlined :class="{ 'vc-past': resource.hidden }")
        v-card-title
            v-menu(v-if='$auth.user && ($auth.user.is_admin || $auth.user.is_editor)' offset-y)
                template(v-slot:activator="{ on }")
                    v-btn.mr-2(v-on='on' color='primary' small icon)
                        v-icon(v-text='mdiDotsVertical')
                v-list
                    v-list-item(v-if='!resource.hidden' @click='hideResource(resource, true)')
                        v-list-item-title <v-icon left v-text='mdiEyeOff'></v-icon> {{$t('admin.hide_resource')}}
                    v-list-item(v-else @click='hideResource(resource, false)')
                        v-list-item-title <v-icon left v-text='mdiEye'></v-icon> {{$t('admin.show_resource')}}
                    v-list-item(@click='deleteResource(resource)')
                        v-list-item-title <v-icon left v-text='mdiDelete'></v-icon> {{$t('admin.delete_resource')}}
                    v-list-item(@click='blockUser(resource)')
                        v-list-item-title <v-icon left v-text='mdiLock'></v-icon> {{$t('admin.block_user')}}

            v-icon.mr-1(v-show='resource.hidden' v-text='mdiEyeOff')

            a(:href='resource.data.url || resource.data.context')
                small {{$time.format(resource.data.published,'ff')}}

        v-card-text

            div.mt-1(v-html='resource_filter(resource.data.content)')
            div.d-flex.flex-wrap
                span.mr-1(v-for='attachment in resource.data.attachment' :key='attachment.url')
                    audio(v-if='isAudio(attachment)' controls)
                        source(:src='attachment.url')
                    v-img.cursorPointer(v-if='isImg(attachment)' :src='attachment.url' @click='showResource(resource)'
                        max-height="250px"
                        max-width="250px"
                        contain :alt='attachment.name')

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'

import { mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiClose, mdiEye, mdiEyeOff, mdiDelete, mdiLock, mdiShareAll, mdiStar } from '@mdi/js'

export default {
    name: 'EventResource',
    data () {
        return { mdiStar, mdiShareAll, mdiDotsVertical, mdiClose, mdiArrowLeft, mdiArrowRight, mdiEyeOff, mdiEye, mdiLock, mdiDelete,
            currentAttachment: 0,
            showResources: false,
            selectedResource: { data: { attachment: [] } },
        }
    },
    props: {
        event: Object
    },
    computed: {
        ...mapState(['settings']),
        currentAttachmentLabel () {
            return get(this.selectedResource, `data.attachment[${this.currentAttachment}].name`, '')
        }  
    },
    methods: {
        isImg (attachment) {
            const type = attachment.mediaType.split('/')[0]
            return type === 'image'
        },
        isAudio (attachment) {
            const type = attachment.mediaType.split('/')[0]
            return type === 'audio'
        },
        resource_filter (value) {
            return value.replace(
                /<a.*href="([^">]+).*>(?:.(?!<\/a>))*.<\/a>/,
                (orig, url) => {
                    // get extension
                    const ext = url.slice(-4)
                    if (['.mp3', '.ogg'].includes(ext)) {
                        return `<audio controls><source src='${url}'></audio>`
                    } else {
                        return orig
                    }
                }
            )
        },
        showResource (resource) {
      this.showResources = true
      this.selectedResource = resource
      // document.getElementById('resourceDialog').focus()
    },
    async hideResource (resource, hidden) {
      await this.$axios.$put(`/resources/${resource.id}`, { hidden })
      resource.hidden = hidden
    },
    async blockUser (resource) {
      try {
        const ret = await this.$root.$confirm('admin.user_block_confirm', { user: resource.ap_user.ap_id })
        if (!ret) { return }
        await this.$axios.post('/instances/toggle_user_block', { ap_id: resource.ap_user.ap_id })
        this.$root.$message('admin.user_blocked', { user: resource.ap_user.ap_id, color: 'success' })
      } catch (e) { }
    },
    async deleteResource (resource) {
      try {
        const ret = await this.$root.$confirm('admin.delete_resource_confirm')
        if (!ret) { return }
        await this.$axios.delete(`/resources/${resource.id}`)
        this.event.resources = this.event.resources.filter(r => r.id !== resource.id)
      } catch (e) { }
    },        
    }
}
</script>