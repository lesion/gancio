<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs}">
            <v-btn v-bind="attrs" :to='to' icon v-on="on" @click='$emit("click")' :color='color'>
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
        to: String
    }
}
</script>