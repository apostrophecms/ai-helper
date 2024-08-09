# Changelog

## 1.0.0-beta.8 (2024-08-09)

* Security: Apostrophe now checks to make sure the current user can edit at least one type of content on the site before making calls to the OpenAI APIs. Upgrading is recommended.
* Updated to use the gpt4o text model by default.
* Image model can be explicitly specified and defaults to `dall-e-2`. Note that `dall-e-3` does not support variations in the same way, so the current UI will have to change if that feature is not added upstream.


## 1.0.0-beta.7 (2024-07-10)

* Add missing UI translation keys.

## 1.0.0-beta.6 (2024-02-21)

* Check that the current user `canCreate` images before showing the `Generate an image with AI` button.

## 1.0.0-beta.5 (2023-09-20)

* `text-davinci-003` model was deprecated, update to the `gpt-3.5-turbo-instruct` model as a new default
* Document how to override the default text generation model and token limit (subject to GPT's own limits)

## 1.0.0-beta.4 (2023-09-14)

Just bumping the `latest` tag, no changes.

## 1.0.0-beta.3 (2023-08-03)

Fixed a bug in the "variants" feature caused by premature PNG to JPEG
conversion. This now happens only when inserting into the media library.

## 1.0.0-beta.2 (2023-05-26)

Convert imported PNGs to JPEGs as this is more appropriate to web
delivery of AI-generated, often realistic images. Reduces image
download time to the browser by at least 80%.

## 1.0.0-beta (2023-04-27)

Initial beta release.
