# ai-helper: AI for content creation in Apostrophe 3

## Purpose

This module enhances Apostrophe with AI-driven helpers. Currently this module offers a button to generate an image from a text prompt
via OpenAI. You will need to [obtain your own API key from OpenAI](https://openai.com/product).

> The OpenAI API is not free to use. Be sure to read the pricing page.

## Install

```bash
npm install @apostrophecms/ai-helper
```

```javascript
// in app.js
modules: {
  '@apostrophecms/ai-helper': {}
}
```

## Run

```bash
export OPENAI_KEY=get-your-own-key-from-openai
node app
```

## Usage

Add an image widget to the page. Click the edit pencil, then "Browse" as you normally would.

When the media manager appears, click the "robot" button in the upper right corner:

![Editing Roles by Group](images/screenshot-1.png)

When the "Generate Image" dialog appears, follow the instructions to enter a plain English
description of the image you want. Then click "Generate." You can do this as many times as
you wish.

When you are happy with the results, click on the best of the four images to insert it
into the media library and select it. Then save your selection as you normally would.
