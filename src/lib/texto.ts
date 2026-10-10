// ============================================================
// UTILIDADES DE TEXTO
// ============================================================

const CONECTORES = new Set(["de", "del", "la", "las", "los", "y"]);

/**
 * Formatea un nombre/apellido para mostrarlo correctamente.
 *
 * Ejemplos:
 * capitalizarNombre("MARIA DE LOS ANGELES") -> "Maria de los Angeles"
 * capitalizarNombre("juan pérez")           -> "Juan Pérez"
 */
export function capitalizarNombre(
  texto: string | null | undefined
): string {
  if (!texto) return "";

  return texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palabra, index) => {
      if (index > 0 && CONECTORES.has(palabra)) return palabra;

      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
}

/**
 * Normaliza un nombre antes de guardarlo en la base de datos.
 *
 * La intención es que nombres y apellidos queden almacenados
 * de forma consistente, independientemente de cómo los escriba
 * el usuario.
 *
 * Ejemplos:
 * "  STALIN   GUACGHIACA " -> "Stalin Guacghiaca"
 * "juan perez"             -> "Juan Perez"
 * "MARIA DE LOS ANGELES"   -> "Maria de los Angeles"
 */
export function normalizarNombre(
  texto: string | null | undefined
): string {
  return capitalizarNombre(texto);
}
