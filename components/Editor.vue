<template lang='pug'>
  .editor(:class='{ "with-border": border }')
    editor-menu-bar.menubar(:editor='editor' v-slot='{ commands, isActive, getMarkAttrs, focused }')
        el-button-group
          el-popover(trigger='hover' placement='bottom-start')
            el-button.float-left(slot='reference' size='mini') <v-icon name='question'/>
            template
              div <v-icon name='heading'/> → Title ⇒ <code>ctrl+shift+4</code> or start a line with <code>#</code>
              div <v-icon name='bold'/> → Bold ⇒ <code>ctrl+b</code>
              div <v-icon name='italic'/> → Italic ⇒ <code>ctrl+i</code>
              div <v-icon name='underline'/> → Underline ⇒ <code>ctrl+u</code>
              div <v-icon name='list-ul'/> → List ⇒ <code>ctrl+shift+8</code> or start a line with <code>-</code>
              div <v-icon name='list-ol'/> → Ordered List ⇒ <code>ctrl+shift+9</code> or start a line with <code>1.</code>
              div <v-icon name='quote-right'/> → Quote ⇒ <code>ctrl+shift+&gt;</code> or start a line with <code>&gt;</code>
              div <v-icon name='link'/> → Link ⇒ Select a word and fill the input
          el-button(size='mini' :class='{ "is-active": isActive.heading({level:4})}' @click='commands.heading({level: 4})') <v-icon name='heading'/>
          el-button(size='mini' :class='{ "is-active": isActive.bold() }' @click='commands.bold')
            <v-icon name='bold' />
          el-button(size='mini' :class='{ "is-active": isActive.italic() }' @click='commands.italic') <v-icon name='italic'/>
          el-button(size='mini' :class='{ "is-active": isActive.underline() }' @click='commands.underline') <v-icon name='underline'/>
          el-button(size='mini' :class='{ "is-active": isActive.link() }' @click='commands.link({href: ""}); $refs.link.focus(); linkActive=true') <v-icon name='link'/>
          input(:value='isActive.link() && getMarkAttrs("link") && getMarkAttrs("link").href || ""' ref='link' :class='{ "is-active": isActive.link() || linkActive }'
            @blur='commands.link({ href: $event.target.value})' @keypress.enter='commands.link({ href: $event.target.value})')
          //- el-button(size='mini' :class='{ "is-active": isActive.strike() }' @click='commands.strike') <v-icon name='strikethrough'/>
        //- br
        //- el-button-group
        //-   el-button(size='mini' :class='{ "is-active": isActive.code() }' @click='commands.code') <v-icon size=16 name='code'/>
        //-   el-button(size='mini' :class='{ "is-active": isActive.bullet_list() }' @click='commands.bullet_list') <v-icon name='list-ul'/>
        //-   //- el-button(size='mini' :class='{ "is-active": isActive.ordered_list() }' @click='commands.ordered_list') <v-icon name='list-ol'/>
        //-   el-button(size='mini' :class='{ "is-active": isActive.blockquote() }' @click='commands.blockquote') <v-icon name='quote-right'/>

        //- el-button.float-right(v-if='!noSave' size='mini' type='success' plain icon='el-icon-check'
        //-   @click='$emit("save", editor.getHTML())') {{$t('common.save')}}

    editor-content.content(:editor='editor' spellcheck='false')
</template>
<script>
import _ from 'lodash'
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap'
import {
  Blockquote,
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Code,
  Italic,
  Link,
  History,
  Strike,
  Underline
} from 'tiptap-extensions'

export default {
  name: 'Editor',
  components: { EditorContent, EditorMenuBar, EditorMenuBubble },
  props: {
    value: { type: String, default: '' },
    border: { type: Boolean, default: false },
    noSave: { type: Boolean, default: false }
  },
  data () {
    return {
      linkActive: false,
      editor: null
    }
  },
  mounted () {
    this.editor = new Editor({
      onUpdate: _.debounce(({ getHTML }) => this.$emit('input', getHTML()), 300),
      content: this.value,
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3, 4, 5, 6] }),
        new OrderedList(),
        new ListItem(),
        new Code(),
        new History(),
        new Link({ openOnClick: false }),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline()
      ]
    })
  },
  beforeDestroy () {
    if (this.editor) { this.editor.destroy() }
  }
}
</script>
<style lang="scss">

.editor {
  $color-black: #000000;
  $color-white: #ffffff;
  $color-grey: #dddddd;
  overflow-y: auto;
  scrollbar-width: thin;

  &.with-border {
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .content {
    padding: 0px 5px 0px 5px;
    flex: 1;
    scrollbar-width: thin;
    overflow-y: auto;
  }

  .menubar {
    position: sticky;
    display: flex;
    top: 0px;
    overflow: hidden;
    z-index: 1;
    background: $color-grey;
    border-radius: 3px;
    padding: 0.1rem;
    transition: opacity 0.2s, visibility 0.2s, left .2s, bottom .2s;

    input {
      padding: 0;
      margin: 1px;
      display: block;
      border: 0;
      color: #444;
      font-size: .8em;
      border-radius: 3px;
      line-height: 100%;
      transition: width .2s;
      padding-left: 5px;
      flex-grow: 1;
    }

    .fa-icon {
      width: auto;
      font-size: 10px;
      height: 1.4em; /* or any other relative font sizes */
      /* You would have to include the following two lines to make this work in Safari */
      // max-width: 100%;
      max-height: 100%;
    }

  }
}

</style>
