import { QUESTION_TYPES, normalizeOptions } from '../config/constants.js';

const VALID_TYPES = Object.values(QUESTION_TYPES);

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// validateSurvey(doc) → { valid: boolean, errors: string[] }
// `doc` shape: { meta, settings, questions: {id: question} }
export function validateSurvey(doc) {
  const errors = [];
  const meta = doc?.meta || {};

  if (!nonEmptyString(meta.title)) errors.push('El título es obligatorio.');
  if (!nonEmptyString(meta.description)) errors.push('La descripción es obligatoria.');
  if (!nonEmptyString(meta.thankYouTitle))
    errors.push('El título de agradecimiento es obligatorio.');
  if (!nonEmptyString(meta.thankYouBody))
    errors.push('El texto de agradecimiento es obligatorio.');
  if (!nonEmptyString(meta.submitLabel))
    errors.push('La etiqueta del botón de envío es obligatoria.');

  const questions = doc?.questions || {};
  const entries = Object.entries(questions);
  if (entries.length === 0) errors.push('La encuesta debe tener al menos una pregunta.');

  const orders = [];
  for (const [id, q] of entries) {
    const label = `Pregunta "${q?.prompt || id}"`;

    if (!VALID_TYPES.includes(q?.type)) {
      errors.push(`${label}: tipo inválido.`);
      continue;
    }
    if (!nonEmptyString(q.prompt)) errors.push(`${label}: el enunciado es obligatorio.`);
    if (!Number.isInteger(q.order) || q.order < 0)
      errors.push(`${label}: el orden debe ser un entero ≥ 0.`);
    else orders.push(q.order);

    validateConfig(q, label, errors);
  }

  // unique order
  if (new Set(orders).size !== orders.length)
    errors.push('Cada pregunta debe tener un orden único.');

  return { valid: errors.length === 0, errors };
}

// Validates dropdown/check options (label objects or legacy strings).
// Returns the array of labels for callers that need the count.
function validateOptions(cfg, label, errors) {
  const opts = normalizeOptions(cfg.options);
  const labels = opts.map((o) => o.label);
  if (labels.length < 2) errors.push(`${label}: necesita al menos 2 opciones.`);
  if (labels.some((l) => !nonEmptyString(l)))
    errors.push(`${label}: las opciones no pueden estar vacías.`);
  if (new Set(labels).size !== labels.length)
    errors.push(`${label}: las opciones no pueden repetirse.`);
  return labels;
}

function validateConfig(q, label, errors) {
  const cfg = q.config || {};
  switch (q.type) {
    case QUESTION_TYPES.BINARY:
      if (!nonEmptyString(cfg.labelA)) errors.push(`${label}: la etiqueta A es obligatoria.`);
      if (!nonEmptyString(cfg.labelB)) errors.push(`${label}: la etiqueta B es obligatoria.`);
      break;

    case QUESTION_TYPES.RANKING: {
      const items = Array.isArray(cfg.items) ? cfg.items : [];
      if (items.length < 2) {
        errors.push(`${label}: el ranking necesita al menos 2 ítems.`);
      } else {
        const ids = [];
        items.forEach((it, i) => {
          if (!nonEmptyString(it?.id)) errors.push(`${label}: el ítem ${i + 1} necesita un id.`);
          else ids.push(it.id);
          if (!nonEmptyString(it?.label))
            errors.push(`${label}: el ítem ${i + 1} necesita una etiqueta.`);
          if (typeof it?.description !== 'string')
            errors.push(`${label}: el ítem ${i + 1} necesita una descripción.`);
        });
        if (new Set(ids).size !== ids.length)
          errors.push(`${label}: los ids de los ítems deben ser únicos.`);
      }
      if (
        !Number.isInteger(cfg.selectCount) ||
        cfg.selectCount < 1 ||
        cfg.selectCount > items.length
      )
        errors.push(`${label}: la cantidad a ordenar debe ser entre 1 y ${items.length}.`);
      break;
    }

    case QUESTION_TYPES.NUMBER:
      if (cfg.min != null && typeof cfg.min !== 'number')
        errors.push(`${label}: el mínimo debe ser un número.`);
      if (cfg.max != null && typeof cfg.max !== 'number')
        errors.push(`${label}: el máximo debe ser un número.`);
      if (cfg.min != null && cfg.max != null && cfg.min >= cfg.max)
        errors.push(`${label}: el mínimo debe ser menor que el máximo.`);
      break;

    case QUESTION_TYPES.TEXT:
      if (!Number.isInteger(cfg.charLimit) || cfg.charLimit < 1)
        errors.push(`${label}: el límite de caracteres debe ser un entero ≥ 1.`);
      break;

    case QUESTION_TYPES.DROPDOWN: {
      validateOptions(cfg, label, errors);
      break;
    }

    case QUESTION_TYPES.CHECK: {
      const labels = validateOptions(cfg, label, errors);
      const n = labels.length;
      if (cfg.min != null && (!Number.isInteger(cfg.min) || cfg.min < 0 || cfg.min > n))
        errors.push(`${label}: el mínimo de selecciones debe ser un entero entre 0 y ${n}.`);
      if (cfg.max != null && (!Number.isInteger(cfg.max) || cfg.max < 1 || cfg.max > n))
        errors.push(`${label}: el máximo de selecciones debe ser un entero entre 1 y ${n}.`);
      if (cfg.min != null && cfg.max != null && cfg.min > cfg.max)
        errors.push(`${label}: el mínimo no puede ser mayor que el máximo.`);
      break;
    }

    default:
      break;
  }
}

// Session label validation (US/spec): non-empty string.
export function validateSessionLabel(label) {
  return nonEmptyString(label);
}
