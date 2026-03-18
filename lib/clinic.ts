/**
 * Función para obtener datos de la clínica desde el backend (server-side)
 * Usa API Key para autenticación
 */
export async function getClinicData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_API_KEY no está configurada');
  }

  try {
    const response = await fetch(`${apiUrl}/clinics/slug/${slug}`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Siempre obtener datos frescos
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Clínica no encontrada
      }
      throw new Error(`Error al obtener datos de la clínica: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching clinic data:', error);
    throw error;
  }
}
