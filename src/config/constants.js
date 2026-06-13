export const QUESTION_TYPES = {
  BINARY: 'binary',
  RANKING: 'ranking',
  NUMBER: 'number',
  TEXT: 'text',
  DROPDOWN: 'dropdown',
  CHECK: 'check',
};

export const QUESTION_TYPE_LIST = [
  { value: QUESTION_TYPES.BINARY, label: 'Binaria' },
  { value: QUESTION_TYPES.RANKING, label: 'Ranking (arrastrar)' },
  { value: QUESTION_TYPES.NUMBER, label: 'Número' },
  { value: QUESTION_TYPES.TEXT, label: 'Texto corto' },
  { value: QUESTION_TYPES.DROPDOWN, label: 'Desplegable' },
  { value: QUESTION_TYPES.CHECK, label: 'Selección múltiple' },
];

export const ROUTES = {
  COVER: '/',
  SURVEY: '/encuesta',
  THANKS: '/gracias',
  RESULTS: '/resultados',
  ADMIN: '/admin',
  ADMIN_SURVEYS: '/admin/surveys',
  ADMIN_PANEL: '/admin/panel',
  ADMIN_DASHBOARD: '/admin/dashboard',
};

export const DEFAULT_META = {
  title: 'Encuesta',
  description: '',
  coverImageUrl: null,
  submitLabel: 'Enviar respuestas',
  thankYouTitle: '¡Gracias!',
  thankYouBody: 'Tus respuestas fueron registradas.',
};

export const DEFAULT_SETTINGS = {
  allowBackNavigation: true,
};

// Type-specific config defaults used when creating a new question.
export function defaultConfigFor(type) {
  switch (type) {
    case QUESTION_TYPES.BINARY:
      return { labelA: 'De acuerdo', labelB: 'En desacuerdo' };
    case QUESTION_TYPES.RANKING:
      return {
        items: [
          { id: 'item-1', label: 'Opción 1', description: '' },
          { id: 'item-2', label: 'Opción 2', description: '' },
        ],
        selectCount: 2,
      };
    case QUESTION_TYPES.NUMBER:
      return { min: null, max: null, placeholder: '' };
    case QUESTION_TYPES.TEXT:
      return { charLimit: 200, placeholder: '' };
    case QUESTION_TYPES.DROPDOWN:
      return {
        options: [
          { label: 'Opción 1', description: '' },
          { label: 'Opción 2', description: '' },
        ],
      };
    case QUESTION_TYPES.CHECK:
      return {
        options: [
          { label: 'Opción 1', description: '' },
          { label: 'Opción 2', description: '' },
        ],
        min: null,
        max: null,
      };
    default:
      return {};
  }
}

// Options may be stored as plain strings (legacy) or { label, description } objects.
// Normalize to objects so renderers/editors can rely on a single shape.
export function normalizeOptions(options) {
  return (options || []).map((o) =>
    typeof o === 'string' ? { label: o, description: '' } : { label: o.label, description: o.description || '' }
  );
}
