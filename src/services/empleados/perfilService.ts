import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

export interface DatosPerfil {
  nombre: string;
  apellidos: string;
  archivoFoto?: File | null; // Recibimos el archivo físico
}

export const actualizarMiPerfil = async (datos: DatosPerfil) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data: perfilAutor } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single();

  if (perfilAutor?.estado === 'baja') { 
    throw new Error('Tu cuenta está desactivada. No puedes hacer modificaciones.');
  }

  let fotoUrlFinal = undefined;

  // =========================================================
  // ☁️ SUBIDA A CLOUDINARY ☁️
  // =========================================================
  if (datos.archivoFoto) {
    const formData = new FormData();
    formData.append('file', datos.archivoFoto);
    
    // IMPORTANTE: Asegúrate de haber guardado tu preset en Cloudinary con este exacto nombre:
    formData.append('upload_preset', 'avatares_app'); 

    // Aquí ya está tu Cloud Name (dgd0apnro) integrado en la URL
    const response = await fetch('https://api.cloudinary.com/v1_1/dgd0apnro/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error("Error de Cloudinary:", await response.text());
      throw new Error('No se pudo subir la imagen a Cloudinary. Verifica tu Upload Preset.');
    }

    const data = await response.json();
    fotoUrlFinal = data.secure_url; // Cloudinary nos devuelve un link seguro automático
  }
  // =========================================================

  // Preparamos los datos a actualizar en la tabla de Supabase
  const updateData: any = {
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    updated_at: new Date().toISOString(),
    updated_by: user.id
  };

  // Solo si se subió una foto nueva y nos devolvió la URL, actualizamos ese campo
  if (fotoUrlFinal) {
    updateData.foto_perfil_url = fotoUrlFinal;
  }

  const { error } = await supabase
    .from('empleados')
    .update(updateData)
    .eq('usuario_id', user.id);

  if (error) {
    console.error("Error de Supabase:", error.message);
    throw new Error('Error al actualizar tu información en la base de datos.');
  }
}