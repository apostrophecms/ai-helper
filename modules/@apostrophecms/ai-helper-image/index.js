const fetch = require('node-fetch');
const cuid = require('cuid');
const path = require('path');

module.exports = {
  improve: '@apostrophecms/image',
  i18n: {
    aposAiHelper: {
      browser: true
    }
  },
  icons: {
    robot: 'Robot'
  },
  utilityOperations: {
    add: {
      aiInsertImage: {
        label: 'Generate an image with AI',
        icon: 'robot',
        iconOnly: true,
        relationships: true,
        button: true,
        modalOptions: {
          modal: 'AposAiHelperGenerateImage'
        }
      }
    }
  },
  apiRoutes(self) {
    return {
      post: {
        async aiHelperGenerate(req) {
          const prompt = self.apos.launder.string(req.body.prompt);
          if (!prompt.length) {
            throw self.apos.error('invalid');
          }
          const result = await self.apos.http.post('https://api.openai.com/v1/images/generations', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_KEY}`
            },
            body: {
              prompt,
              n: 4,
              size: '256x256'
            }
          });
          if (!result.data) {
            throw self.apos.error('error');
          }
          const urls = result.data.map(item => item.url);
          const images = [];
          for (const url of urls) {
            const id = cuid();
            await self.apos.cache.set('aiHelperImage', id, {
              url,
              prompt
            });
            images.push({
              id,
              url,
              prompt
            });
          }
          return {
            images
          };
        },
        async aiHelperAccept(req) {
          const id = self.apos.launder.id(req.body.id);
          if (!id.length) {
            throw self.apos.error('invalid');
          }
          const image = await self.apos.cache.get('aiHelperImage', id);
          if (!image) {
            throw self.apos.error('notfound');
          }
          const { url, prompt } = image;
          // apos.http has a bug with binary data, use node-fetch
          const response = await fetch(url);
          const buffer = await response.buffer();
          const writeFile = require('util').promisify(require('fs').writeFile);
          const temp = path.join(self.apos.rootDir, `data/temp/${id}.png`);
          try {
            await writeFile(temp, buffer);
            const attachment = await self.apos.attachment.insert(req, {
              name: self.apos.util.slugify(prompt) + '.png',
              path: temp
            });
            const image = await self.apos.image.insert(req, {
              title: prompt,
              attachment
            });
            self.apos.attachment.all(image, { annotate: true });
            console.log('returning:', image);
            return image;
          } finally {
            const unlink = require('util').promisify(require('fs').unlink);
            try {
              await unlink(temp);
            } catch (e) {
              // Don't care if it never got there
            }
          }
        }
      }
    };
  }
};
