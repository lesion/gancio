<template lang='pug'>
  div(style="position: relative")

    b-input-group
      input.form-control(type="search"
        ref="input"
        :placeholder="placeholder"
        v-model="search"
        @input="update"
        autocomplete="off"
        @keydown.backspace="backspace"
        @keydown.up.prevent="up"
        @keydown.down.prevent="down"
        @keydown.enter="hit"
        @keydown.esc="reset(true)"
        @blur="focus = false"
        @focus="focus = true")

    div
      b-badge.mr-1(@click="removeSelected(sel)"
        v-for="sel in selectedLabel"
        :key="sel") <v-icon color='orange' name='times' /> {{sel}}

    b-list-group.groupMenu(v-show='showDropdown')
      b-list-group-item(:key="$index" v-for="(item, $index) in matched"
        href='#'
        :class="{'active': isActive($index)}"
        @mousedown.prevent="hit"
        @mousemove="setActive($index)")
          slot(:name="templateName") {{textField ? item[textField] : item}}

</template>

<script>

export default {
  props: {
    value: {
      twoWay : true,
      type: [String, Array, Set],
      default: ''
    },
    data: {
      type: Array
    },
    template: {
      type: String
    },
    templateName: {
      type: String,
      default: 'default'
    },
    valueField: {
      type: String,
      default: null
    },
    textField: {
      type: String,
      default: null
    },
    showClear: {
      type: Boolean,
      default: true
    },
    matchCase: {
      type: Boolean,
      default: false
    },
    matchStart: {
      type: Boolean,
      default: false
    },
    onHit: {
      type: Function,
      default () {
        this.reset()
      }
    },
    placeholder: {
      type: String
    },
    updateOnMatchOnly: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxMatch: {
      type: Number,
      default: 4
    }
  },
  data () {
    return {
      focus: false,
      noResults: true,
      current: 0,
      search: '',
      selected: [],
    }
  },
  watch: {
    value(newValue) {
      if (!newValue) {
        this.search = '';
        if (this.multiple) this.$emit('input', []) // this.selected = [];
      } else {
        if (!this.multiple) {
          this.search = newValue
        } else {
          this.selected = newValue 
        }
      }
    }
  },
  computed: {
    showDropdown () {
      return this.focus
    },
    selectedValues () {
      return this.selected.map(s => this.valueField ? (s[this.valueField] || s)  : s);
    },
    selectedLabel () {
      return this.selected.map(s => this.textField ? s[this.textField] || s: s);
    },
    matched () {
      if (this.data) {
        return this.data.filter(value => {
          if(this.textField) value = value[this.textField];
          if (this.multiple && this.selectedLabel.includes(value)) return false;
          value = this.matchCase ? value : value.toLowerCase()
          const query = this.matchCase ? this.search : this.search.toLowerCase()
          return this.matchStart ? value.indexOf(query) === 0 : value.indexOf(query) !== -1
        }).slice(0, this.maxMatch)
      }
    }
  },
  methods: {
    update (e, value) {
      if (this.multiple && this.search[this.search.length-1] === ',') {
        this.search = this.search.substr(0, this.search.length-1)
        this.hit(e)
        return
      }
      if (!this.updateOnMatchOnly && !this.multiple) this.$emit('input', this.search);
      this.focus = true;
      if (!this.matched.length) {
        this.focus = false;
        this.current = 0
        return;
      }

      // current selected item has to be in the match
      if (this.matched.length <= this.current) {
        this.current = this.matched.length-1;
      }
    },
    backspace () {
      if (this.search) return
      this.selected.splice(-1, 1)
      this.$emit('input', this.selected.length ? this.selectedValues : '');
    },
    reset (esc=false) {
      this.search = '';
      this.current = 0;
      this.$refs.input.focus();
      if (esc) {
        this.focus = false
      } else {
        this.selected = [];
        this.$emit('input', '');
      }
    },
    setActive (index) {
      this.current = index
    },
    isActive (index) {
      return this.current === index
    },

    removeSelected (label) {
      this.selected = this.selected.filter( s => (this.textField ? s[this.textField] || s: s) !== label);
      this.$emit('input', this.selected.length ? this.selectedValues :  []);
    },

    // click or enter on curren item
    hit (e) {
      e.preventDefault();
      let code = '';
      let item = '';

      if (this.matched.length !== 0 && this.focus) {
        item = this.matched[this.current];
        code = this.textField ? item[this.textField] : item;
        // code = this.valueField ? item[this.valueField] : item;
      } else {
        code = this.search;
      }
      if (this.multiple) {
        if (code) {
          this.selected.push(code);
          this.search = '';
          this.$emit('input', this.selected);
          this.focus = false;
          // this.update();
        }
      } else {
        this.$emit('input', code);
        this.current = 0;
        this.focus = false;
        this.search = code
      }
      this.$emit('enter')
    },

    // manage up/down arrow key
    up () {
      if (this.current > 0) this.current--
    },
    down () {
      if (this.current < this.matched.length - 1) this.current++
    }
  },
}
</script>

<style scoped>
.groupMenu {
  position: absolute;
  top: 40px;
  width: 100%;
  z-index: 2;
}

.badge {
  cursor: pointer;
}
</style>
