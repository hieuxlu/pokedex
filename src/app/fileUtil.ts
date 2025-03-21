import { Crop } from 'react-image-crop';

export const readAsUrlAsync = async (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise<string>((resolve, reject) => {
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });

    reader.addEventListener('error', () => {
      reject();
    });

    reader.addEventListener('abort', () => {
      reject();
    });
  });
};

export const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
  if (!image || !crop.width || !crop.height) {
    return;
  }

  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  const base64Image = canvas.toDataURL('image/png');
  return { canvas, base64Image };
};
