/**
 * Servicio dedicado para manejar subidas a Cloudinary desde el cliente.
 * Al estar separado, optimizamos el tamaño del bundle del performanceService.
 */

export const uploadImageToCloudinary = async (
  file: File, 
  preset: string = 'evidencias_app'
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  // Considera guardar esta URL en tu .env.local (ej: process.env.NEXT_PUBLIC_CLOUDINARY_URL)
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgd0apnro/image/upload';

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('No se pudo subir la imagen. Intenta con un archivo más ligero.');
  }

  const data = await response.json();
  return data.secure_url;
};