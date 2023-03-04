<template>
  <AposModal
    class="apos-ai-helper-generate-image"
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
          <form class="apos-ai-helper-form">
            <textarea v-model="prompt" :placeholder="$t('aposAiHelper:placeholderText')" />
            <AposButton
              :disabled="!prompt.length"
              @click.prevent="generate"
              :label="$t('aposAiHelper:generateImage')"
            />
            <p v-if="error">
              An error occurred.
            </p>
            <div class="apos-ai-helper-images">
              <button
                v-for="image in images"
                :key="image.id"
                class="apos-ai-helper-image"
                @click.prevent="save(image.id)"
              >
                <img :src="image.url">
              </button>
            </div>
          </form>
        </template>
      </AposModalBody>
    </template>
  </AposModal>
</template>

<script>
export default {
  emits: [ 'modal-result' ],
  data() {
    return {
      modal: {
        active: false,
        type: 'slide',
        origin: 'right',
        showModal: false,
        width: 'full'
      },
      error: false,
      prompt: '',
      images: []
    };
  },
  async mounted() {
    this.modal.active = true;
  },
  methods: {
    close() {
      this.modal.showModal = false;
    },
    async generate() {
      this.error = false;
      this.images = [];
      try {
        const result = await self.apos.http.post(`${apos.image.action}/ai-helper-generate`, {
          body: {
            prompt: this.prompt
          },
          busy: true
        });
        this.images = result.images;
      } catch (e) {
        this.error = true;
      }
    },
    async save(id) {
      try {
        const image = await self.apos.http.post(`${apos.image.action}/ai-helper-accept`, {
          body: {
            id
          }
        });
        console.log('posting the content changed event after successful accept');
        this.$emit('modal-result', image);
        this.modal.showModal = false;
        apos.bus.$emit('content-changed', {
          doc: image,
          action: 'insert',
          select: true
        });
      } catch (e) {
        this.error = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.apos-ai-helper-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.apos-ai-helper-images {
  display: grid;
  grid-template-columns: auto auto;
  gap: 16px;
}
.apos-ai-helper-image {
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
textarea {
  height: 4em;
}
</style>
