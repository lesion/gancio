<template>
    <v-card class="eventModeration">
        <v-card-title>{{$t('common.moderation')}} <v-spacer /><v-btn text label icon @click="$emit('close', false)" size='small'><v-icon v-text="mdiChevronRight"/></v-btn></v-card-title>
        <v-card-text class="d-flex flex-column flex-grow-1 overflow-auto">
            <v-textarea :label="$t('event.message')" :hint="$t('event.message_hint')" persistent-hint v-model='message' rows="2" class="mb-2"/>
            <template v-if="$auth.user.is_admin || $auth.user.is_editor">
                <v-btn class='mb-1' small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(false)" color="primary">{{$t('event.send_to_admins')}}</v-btn>
                <v-btn class='mb-1' small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(true)" color="primary">{{$t('event.send_to_author_too')}}</v-btn>
            </template>
            <v-btn v-else small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(true)" color="primary">send</v-btn><br/>
            <v-list dense class='messageList'>
                <v-list-item v-for="(item, index) in messages" :key="index" class="px-2">
                    <v-list-item-content>
                        <span v-if="item?.message">{{ item.message }}</span>
                        <v-list-item-subtitle>{{ $time.format(item.createdAt, 'EEEE d MMMM HH:mm') }} / {{ item.author }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-btn v-if='!event.isAnon' class='mb-1' small outlined :disabled='loading' :loading='loading' @click="disableAuthor" color="primary">{{$t('event.disable_author')}}</v-btn>
        </v-card-text>
    </v-card>    
</template>
<script>
import { mdiMessageTextOutline, mdiSend, mdiChevronRight } from '@mdi/js'
import TBtn from '../components/TBtn.vue'

export default {
    name: 'EventModeration',
    components: { TBtn },
    props: {
        event: {
            type: Object,
            default: () => ({})
        },
    },    
    data () {
        return {
            mdiMessageTextOutline, mdiSend, mdiChevronRight,
            message: '',
            messages: [],
            loading: false,
        }
    },
    async mounted () {
        this.messages = await this.$axios.$get(`/event/messages/${this.event.id}`)
    },
    methods: {
        async disableAuthor () {
            // ask confirmation only to disable
            const ret = await this.$root.$confirm('admin.disable_user_confirm')
            if (!ret) { return }
            this.loading = true
            try {
                await this.$axios.$put(`/event/disable_author/${this.event.id}`)
                this.$root.$message("Author disabled!", { color: 'success' })
            } catch (e) {
                this.$root.$message(e, { color: 'warning' })
            }
            this.loading = false
        },
        async sendMessage (is_author_visible) {
            try {
                this.loading = true
                await this.$axios.$post(`/event/messages/${this.event.id}`, {
                    is_author_visible,
                    message: this.message,
                })
                this.message = ''
                this.loading = false
                this.messages = await this.$axios.$get(`/event/messages/${this.event.id}`)
            } catch (e) {
                this.$root.$message(e, { color: 'warning' })
                this.loading = false
                console.error(e)
            }
        }
    }
}
</script>
<style>
.eventModeration {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.eventModeration .messageList {
    overflow-y: auto;
    flex-grow: 1;
    padding: 0px;
    margin: 8px 0;
}

.eventModeration .v-textarea {
    flex-grow: 0;
}

.eventModeration .messageList .v-list-item {
    border-top: 1px solid rgba(100,100,100,.3);
    word-break: break-word;
}

</style>