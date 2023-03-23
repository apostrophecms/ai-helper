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
              @click.prevent="generate({})"
              :label="$t('aposAiHelper:generateImage')"
            />
            <p v-if="error">
              An error occurred.
            </p>
            <div class="apos-ai-helper-images">
              <div
                v-for="image in images"
                :key="image._id"
                class="apos-ai-helper-image"
                :style="imageStyle(image)"
              >
                <AposButton
                  :disabled="image.accepted"
                  @click.prevent="save(image)"
                  icon="plus-icon"
                  :icon-only="true"
                  :label="$t('aposAiHelper:select')"
                />
                <AposButton
                  @click.prevent="generate({ variantOf: image })"
                  icon="group-icon"
                  :icon-only="true"
                  :label="$t('aposAiHelper:variations')"
                />
                <AposButton
                  @click.prevent="remove(image)"
                  :label="$t('aposAiHelper:delete')"
                  icon="delete-icon"
                  :icon-only="true"
                />
              </div>
            </div>
          </form>
        </template>
      </AposModalBody>
    </template>
  </AposModal>
</template>

<script>
export default {
  emits: [ 'modal-result', 'safe-close' ],
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
    this.images = (await self.apos.http.get(`${apos.image.action}/ai-helper`, { busy: true })).images;
  },
  methods: {
    close() {
      this.modal.showModal = false;
    },
    async generate({ variantOf }) {
      this.error = false;
      try {
        const result = await self.apos.http.post(`${apos.image.action}/ai-helper`, {
          body: {
            prompt: variantOf?.prompt || this.prompt,
            variantOf: variantOf?._id
          },
          busy: true
        });
        this.images = [ ...result.images, ...this.images ];
        console.log(JSON.stringify(this.images, null, '  '));
        this.$el.scrollTo(0, 0);
      } catch (e) {
        console.error(e);
        this.error = true;
      }
    },
    imageStyle(image) {
      return {
        'background-image': `url(${image.url})`
      };
    },
    async save({ _id }) {
      try {
        console.log(`id is ${_id}`);
        const updated = await self.apos.http.patch(`${apos.image.action}/ai-helper/${_id}`, {
          body: {
            accepted: 1
          },
          busy: true
        });
        const image = updated._image;
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
    },
    async remove({ _id }) {
      this.images = this.images.filter(image => image._id !== _id);
      await self.apos.http.delete(`${apos.image.action}/ai-helper/${_id}`, {
        busy: true
      });
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
  aspect-ratio: 1;
  background-size: cover;
  display: flex;
}
textarea {
  height: 4em;
}
</style>
