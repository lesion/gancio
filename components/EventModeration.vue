<template>
    <v-card class="eventModeration">
        <v-card-title>{{$t('common.moderation')}} <v-spacer /><v-btn text label icon @click="$emit('close', false)" size='small'><v-icon v-text="mdiChevronRight"/></v-btn></v-card-title>
        <v-card-text class="d-flex flex-column flex-grow-1 overflow-auto">
            <v-textarea :label="$t('event.message')" :hint="$t(isAdmin ? 'event.message_hint' : 'event.message_author_hint')" persistent-hint v-model='message' rows="2" class="mb-2"/>
            <template v-if="isAdmin">
                <v-btn class='mb-1' small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(false)" color="primary">{{$t('event.send_to_admins')}}</v-btn>
                <v-btn v-if='!event.isAnon' class='mb-1' small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(true)" color="primary">{{$t('event.send_to_author_too')}}</v-btn>
            </template>
            <v-btn v-else small outlined :disabled='!message || loading' :loading='loading' @click="sendMessage(true)" color="primary">send</v-btn><br/>
            <v-list dense class='messageList'>
                <v-list-item v-for="(item, index) in messages" :key="index" class="px-2" :class="item.author">
                    <v-list-item-content>
                        <span v-if="item?.message">{{ item.message }}</span>
                        <v-list-item-subtitle class="font-weight-light">{{ $time.format(item.createdAt, 'EEEE d MMMM HH:mm') }} / {{ item.author }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
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
    computed: {
        isAdmin () {
            return this.$auth.user.is_admin || this.$auth.user.is_editor
        }
    },
    methods: {
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
    border-top: 1px solid rgba(100,100,100,.07);
    word-break: break-word;
}

.eventModeration .messageList .v-list-item.ADMIN {
    background-color: rgba(200,100,100,0.1);
    border-left: 2px solid rgba(255,69,0, 0.3);
}

.eventModeration .messageList .v-list-item.AUTHOR {
    border-left: 2px solid lightblue;
    background-color: rgba(35, 193, 255, 0.1);
}


</style>