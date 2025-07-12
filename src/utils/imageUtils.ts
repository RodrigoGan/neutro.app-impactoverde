export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImage = (file: File): ImageValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou WebP' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { isValid: true };
};

export const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar se necessário
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao comprimir imagem'));
            }
          },
          file.type,
          0.7 // Qualidade da compressão (0.7 = 70%)
        );
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
  });
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}; 