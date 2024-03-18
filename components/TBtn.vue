<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs}">
            <v-btn v-bind="attrs" :to='to' :large="large" icon v-on="on" @click='$emit("click")' :color='color'>
                <slot />
            </v-btn>
        </template>
        <span>{{ tooltip }}</span>
    </v-tooltip>
</template>
<script>
export default {
    name: 'TBtn',
    props: {
        tooltip: String,
        color: String,
        to: String,
        large: { type: Boolean, default: false }
    }
}
</script>