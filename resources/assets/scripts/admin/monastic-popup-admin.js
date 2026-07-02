function initMonasticPopupImageControl(root = document) {
  const control = root.querySelector('[data-monastic-popup-image-control]');

  if (!control || !globalThis.wp?.media) {
    return;
  }

  const input = control.querySelector('[data-monastic-popup-image-id]');
  const preview = control.querySelector('[data-monastic-popup-image-preview]');
  const selectButton = control.querySelector('[data-monastic-popup-select-image]');
  const removeButton = control.querySelector('[data-monastic-popup-remove-image]');
  const config = globalThis.yoganandaMonasticPopupAdmin || {};
  let frame = null;

  if (!input || !preview || !selectButton || !removeButton) {
    return;
  }

  selectButton.addEventListener('click', (event) => {
    event.preventDefault();

    if (!frame) {
      frame = createMediaFrame(config);
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first()?.toJSON();

        if (attachment) {
          setImage({ attachment, input, preview, removeButton });
        }
      });
    }

    frame.open();
  });

  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    clearImage({ input, preview, removeButton });
  });
}

function createMediaFrame(config) {
  return globalThis.wp.media({
    title: config.frameTitle || 'Select popup image',
    button: {
      text: config.buttonText || 'Use this image',
    },
    library: {
      type: 'image',
    },
    multiple: false,
  });
}

function setImage({ attachment, input, preview, removeButton }) {
  input.value = attachment.id || '';
  preview.replaceChildren(previewImageFor(attachment));
  removeButton.disabled = false;
}

function clearImage({ input, preview, removeButton }) {
  input.value = '';
  preview.replaceChildren();
  removeButton.disabled = true;
}

function previewImageFor(attachment) {
  const image = document.createElement('img');
  const medium = attachment.sizes?.medium;

  image.src = medium?.url || attachment.url;
  image.alt = attachment.alt || '';
  image.style.maxWidth = '240px';
  image.style.height = 'auto';
  image.style.display = 'block';

  return image;
}

document.addEventListener('DOMContentLoaded', () => initMonasticPopupImageControl());
