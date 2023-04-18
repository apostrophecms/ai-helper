<template>
  <div
    v-if="active"
    v-click-outside-element="close"
    class="apos-popover apos-ai-helper-text__dialog"
    x-placement="bottom"
    :class="{
      'apos-is-triggered': active,
      'apos-has-selection': true
    }"
  >
    <AposContextMenuDialog
      menu-placement="bottom-start"
    >
      <form class="apos-ai-helper-form">
        <p>
          {{ $t('aposAiHelper:textPromptLabel') }}
        </p>
        <textarea v-model="prompt" />
        <p v-if="error">
          An error occurred.
        </p>
      </form>
      <footer class="apos-ai-helper-text__footer">
        <AposButton
          type="default" label="apostrophe:cancel"
          @click="close"
          :modifiers="formModifiers"
        />
        <AposButton
          type="primary" label="aposAiHelper:generateTextAction"
          @click="save"
          :disabled="!prompt.length"
          :modifiers="formModifiers"
        />
      </footer>
    </AposContextMenuDialog>
  </div>
</template>

<script>
export default {
  name: 'AposAiHelperTextDialog',
  emits: [ 'close', 'beforeCommands' ],
  props: {
    editor: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      prompt: '',
      error: false,
      formModifiers: [ 'small', 'margin-micro' ]
    };
  },
  watch: {
    active(newVal) {
      if (newVal) {
        window.addEventListener('keydown', this.keyboardHandler);
      } else {
        window.removeEventListener('keydown', this.keyboardHandler);
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    async save() {
      this.error = false;
      try {
        const headingLevels = this.options.styles.filter(style => style.tag.match(/^h\d$/)).map(style => parseInt(style.tag.replace(/h/i, '')));
        const result = await self.apos.http.post(`${getOptions().action}/ai-helper`, {
          body: {
            prompt: this.prompt,
            headingLevels            
          },
          busy: true
        });
        this.$emit('beforeCommands');
        // newlines shouldn't matter but they do to tiptap, so get rid of them
        const html = result.html.replace(/>\n+</g, '><');
        this.editor.commands.insertContent(html);
        this.close();
      } catch (e) {
        console.error(e);
        this.error = true;
      }
    },
    keyboardHandler(e) {
      if (e.keyCode === 27) {
        this.close();
      }
    }
  }
};

function getOptions() {
  return apos.modules['@apostrophecms/rich-text-widget'];
}
</script>

<style lang="scss" scoped>
  .apos-ai-helper-text__dialog {
    z-index: $z-index-modal;
    position: absolute;
    top: calc(100% + 5px);
    left: -15px;
    opacity: 0;
    pointer-events: none;
  }

  .apos-ai-helper-text__dialog.apos-is-triggered {
    opacity: 1;
    pointer-events: auto;
  }

  .apos-context-menu__dialog {
    width: 500px;
  }

  p {
    font-size: 14px;
    line-height: 1.25;
  }

  textarea {
    width: 100%;
    line-height: 1.25;
    padding: 4px;
    height: 48px;
    resize: none;
  }

  .apos-is-active {
    background-color: var(--a-base-7);
  }

  .apos-ai-helper-text__footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .apos-ai-helper-text__footer .apos-button__wrapper {
    margin-left: 7.5px;
  }

  .apos-ai-helper-text__remove {
    display: flex;
    justify-content: flex-end;
  }
</style>
