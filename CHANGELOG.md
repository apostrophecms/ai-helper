# Changelog

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
