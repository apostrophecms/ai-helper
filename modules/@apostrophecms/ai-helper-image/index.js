const fetch = require('node-fetch');
const cuid = require('cuid');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');
const writeFile = require('util').promisify(fs.writeFile);
const unlink = require('util').promisify(require('fs').unlink);

module.exports = {
  improve: '@apostrophecms/image',
  i18n: {
    aposAiHelper: {
      browser: true
    }
  },
  icons: {
    'robot-icon': 'Robot',
    'group-icon': 'Group'
  },
  utilityOperations: {
    add: {
      aiInsertImage: {
        label: 'Generate an image with AI',
        icon: 'robot-icon',
        iconOnly: true,
        relationships: true,
        button: true,
        modalOptions: {
          modal: 'AposAiHelperImageManager'
        }
      }
    }
  },
  async init(self) {
    self.aiHelperImages = self.apos.db.collection('aposAiHelperImages');
    await self.aiHelperImages.createIndex({
      userId: 1,
      createdAt: -1
    });
  },
  methods(self) {
    return {
      async aiHelperFetchImage(_id, url) {
        const response = await fetch(url);
        const buffer = await response.buffer();
        const temp = path.join(self.apos.rootDir, `data/temp/${_id}.png`);
        await writeFile(temp, buffer);
        return temp;
      }
    };
  },
  apiRoutes(self) {
    return {
      get: {
        async 'ai-helper'(req) {
          const images = await self.aiHelperImages.find({
            userId: req.user._id,
            createdAt: {
              // OpenAI image URLs are only good for an hour
              $gte: new Date(Date.now() - 1000 * 60 * 60)
            }
          }).sort({
            createdAt: -1
          }).toArray();
          return {
            images
          };
        }
      },
      delete: {
        async 'ai-helper/:_id'(req) {
          await self.aiHelperImages.removeOne({
            _id: req.params._id,
            userId: req.user._id
          });
          return {};
        }
      },
      post: {
        async 'ai-helper'(req) {
          const prompt = self.apos.launder.string(req.body.prompt);
          const variantOf = self.apos.launder.id(req.body.variantOf);
          if (!prompt.length) {
            throw self.apos.error('invalid');
          }
          const body = variantOf ? new FormData() : {};
          if (!variantOf) {
            set('prompt', prompt);
          }
          set('n', 4);
          set('size', '1024x1024');
          let temp;
          // Fake results for cheap & offline testing
          if (process.env.APOS_AI_HELPER_MOCK) {
            const now = new Date();
            const images = [];
            for (let i = 0; (i < 4); i++) {
              images.push({
                _id: cuid(),
                userId: req.user._id,
                createdAt: now,
                url: self.apos.asset.url('/modules/@apostrophecms/ai-helper-image/placeholder.jpg')
              });
            }
            return {
              images
            };
          }
          try {
            if (variantOf) {
              const existing = await self.aiHelperImages.findOne({
                _id: variantOf
              });
              if (!existing) {
                throw self.apos.error('notfound');
              }
              temp = await self.aiHelperFetchImage(existing._id, existing.url);
              body.append('image', fs.createReadStream(temp));
            }
            const command = variantOf ? 'variations' : 'generations';
            const result = await self.apos.http.post(`https://api.openai.com/v1/images/${command}`, {
              headers: {
                Authorization: `Bearer ${process.env.APOS_OPENAI_KEY}`
              },
              body
            });
            if (temp) {
              fs.unlinkSync(temp);
            }
            if (!result.data) {
              throw self.apos.error('error');
            }
            const urls = result.data.map(item => item.url);
            const images = [];
            const now = new Date();
            for (const url of urls) {
              const id = cuid();
              const image = {
                _id: id,
                userId: req.user._id,
                createdAt: now,
                url,
                prompt
              };
              await self.aiHelperImages.insertOne(image);
              images.push(image);
            }
            return {
              images
            };
          } finally {
            if (temp) {
              try {
                await unlink(temp);
              } catch (e) {
                // Don't care if it never got there
              }
            }
          }
          function set(key, value) {
            if (variantOf) {
              body.append(key, value);
            } else {
              body[key] = value;
            }
          }
        }
      },
      patch: {
        async 'ai-helper/:_id'(req) {
          const _id = req.params._id;
          if (!req.body.accepted) {
            // Currently the only property that can be PATCHed is "accepted"
            throw self.apos.error('invalid');
          }
          if (!_id.length) {
            throw self.apos.error('invalid');
          }
          const image = await self.aiHelperImages.findOne({ _id });
          if (!image) {
            throw self.apos.error('notfound');
          }
          const { url, prompt } = image;
          // apos.http has a bug with binary data, use node-fetch
          let temp;
          try {
            temp = await self.aiHelperFetchImage(_id, url);
            const attachment = await self.apos.attachment.insert(req, {
              name: self.apos.util.slugify(prompt) + '.png',
              path: temp
            });
            const image = await self.apos.image.insert(req, {
              title: prompt,
              attachment
            });
            self.apos.attachment.all(image, { annotate: true });
            const updated = {
              ...image,
              accepted: true,
              imageId: image._id,
              _image: image
            };
            await self.aiHelperImages.updateOne({ _id }, {
              $set: {
                accepted: true,
                imageId: image._id
              }
            });
            return updated;
          } finally {
            try {
              if (temp) {
                await unlink(temp);
              }
            } catch (e) {
              // Don't care if it never got there
            }
          }
        }
      }
    };
  }
};
