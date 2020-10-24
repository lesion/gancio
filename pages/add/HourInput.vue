<template lang="pug">
  v-row
    v-col.col-6
      v-menu(v-model='startTimeMenu'
        :close-on-content-click="false"
        transition="slide-x-transition"
        ref='startTimeMenu'
        :return-value.sync="time.start"
        offset-y
        absolute
        top
        max-width="290px"
        min-width="290px")
        template(v-slot:activator='{ on }')
          v-text-field(
            :label="$t('event.from')"
            :rules="[$validators.required('event.from')]"
            :value='time.start'
            v-on='on'
            clearable)
        v-time-picker(
          v-if='startTimeMenu'
          :label="$t('event.from')"
          format="24hr"
          ref='time_start'
          :allowed-minutes="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
          v-model='time.start'
          @click:minute="selectTime('start')")

    v-col.col-6
      v-menu(v-model='endTimeMenu'
          :close-on-content-click="false"
          transition="slide-x-transition"
          ref='endTimeMenu'
          :return-value.sync="time.end"
          offset-y
          absolute
          top
          max-width="290px"
          min-width="290px")
        template(v-slot:activator='{ on }')
          v-text-field(
            :label="$t('event.due')"
            :value='time.end'
            v-on='on'
            clearable
            readonly)
        v-time-picker(
          v-if='endTimeMenu'
          :label="$t('event.due')"
          format="24hr"
          :allowed-minutes="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
          v-model='time.end'
          @click:minute="selectTime('end')")

</template>
<script>
export default {
  name: 'HourInput',
  props: {
    value: { type: Object, default: () => { } }
  },
  data () {
    return {
      time: {},
      startTimeMenu: false,
      endTimeMenu: false
    }
  },
  methods: {
    selectTime (type) {
      this.$refs[`${type}TimeMenu`].save(this.time.end)
      this.$emit('input', this.time)
    }
  }
}
</script>
