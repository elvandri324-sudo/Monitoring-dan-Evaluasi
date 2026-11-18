/**
 * Resize and compress an uploaded image file into a lightweight Data URL
 * suitable for storing profile avatars in state and localStorage.
 */
export function compressProfileImage(
  file: File,
  maxSize: number = 256,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Ukuran file maksimal 5 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid atau rusak.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Center-crop to square for crisp 1:1 avatar framing
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        const targetSize = Math.min(maxSize, minDim);

        canvas.width = targetSize;
        canvas.height = targetSize;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputMime, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
