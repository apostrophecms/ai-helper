<template>
  <AposModal
    class="apos-ai-helper-image-editor"
    :modal="modal"
    modal-title="aposAiHelper:generateImage"
    @inactive="modal.active = false"
    @show-modal="modal.showModal = true"
    @esc="close"
    @no-modal="$emit('safe-close')"
  >
    <template #main>
      <AposModalBody>
        <template #bodyMain>
          <form>
            <img
              class="apos-ai-helper-image"
              :src="image.url"
            >
            <div class="apos-ai-helper-image-buttons">
              <AposButton
                :disabled="image.accepted"
                @click.prevent="action('save')"
                icon="plus-icon"
                :label="$t('aposAiHelper:select')"
              />
              <AposButton
                @click.prevent="action('variations')"
                icon="group-icon"
                :label="$t('aposAiHelper:variations')"
              />
              <AposButton
                @click.prevent="action('delete')"
                :label="$t('aposAiHelper:delete')"
                :icon-only="true"
              />
            </div>
            <p v-if="error">
              An error occurred.
            </p>
          </form>
        </template>
      </AposModalBody>
    </template>
  </AposModal>
</template>

<script>
export default {
  props: {
    image: {
      type: Object,
      required: true
    }
  },
  emits: [ 'modal-result', 'safe-close' ],
  data() {
    return {
      modal: {
        active: false,
        type: 'overlay',
        showModal: true
      },
      error: false
    };
  },
  async mounted() {
    this.modal.active = true;
  },
  methods: {
    close() {
      this.modal.showModal = false;
    },
    action(action) {
      console.log('action is:', action);
      this.modal.showModal = false;
      this.$emit('modal-result', {
        action
      });
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .apos-modal__main, ::v-deep .apos-modal__body-inner, ::v-deep .apos-modal__body-main {
  height: 100%;
  min-height: 0;
}
form {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.apos-ai-helper-image {
  object-fit: contain;
  min-height: 0;
}
.apos-ai-helper-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
</style>
