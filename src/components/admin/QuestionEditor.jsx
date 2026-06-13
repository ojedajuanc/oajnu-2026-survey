import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Toggle from '../ui/Toggle.jsx';
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LIST,
  defaultConfigFor,
  normalizeOptions,
} from '../../config/constants.js';

let itemSeq = 0;
function newItemId() {
  itemSeq += 1;
  return `item-${Date.now()}-${itemSeq}`;
}

// question: { id, type, prompt, required, config, order }. onSave(updatedQuestion).
export default function QuestionEditor({ question, onSave, onClose }) {
  const [type, setType] = useState(question.type);
  const [prompt, setPrompt] = useState(question.prompt || '');
  // Legacy ranking questions stored their note in config.instruction; surface it here.
  const [description, setDescription] = useState(
    question.description || question.config?.instruction || ''
  );
  const [required, setRequired] = useState(!!question.required);
  const [config, setConfig] = useState(question.config || defaultConfigFor(question.type));

  // Switching type resets config to that type's defaults.
  function changeType(newType) {
    setType(newType);
    setConfig(defaultConfigFor(newType));
  }

  function patchConfig(patch) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function handleSave() {
    // Drop the legacy config.instruction now that description is top-level.
    const { instruction, ...cleanConfig } = config;
    onSave({
      ...question,
      type,
      prompt,
      description: description.trim() ? description : '',
      required,
      config: cleanConfig,
    });
  }

  return (
    <Modal title="Editar pregunta" onClose={onClose}>
      <div className="field">
        <label className="field__label">Tipo</label>
        <select className="select" value={type} onChange={(e) => changeType(e.target.value)}>
          {QUESTION_TYPE_LIST.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label">Enunciado</label>
        <input
          className="input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="¿Qué querés preguntar?"
        />
      </div>

      <div className="field">
        <label className="field__label">Descripción (opcional)</label>
        <textarea
          className="input"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Texto de ayuda que se muestra debajo del enunciado"
        />
      </div>

      <div className="field">
        <Toggle checked={required} onChange={setRequired} label="Obligatoria" />
      </div>

      <TypeFields type={type} config={config} patchConfig={patchConfig} setConfig={setConfig} />

      <div className="row row--between" style={{ marginTop: 16 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar pregunta
        </Button>
      </div>
    </Modal>
  );
}

function TypeFields({ type, config, patchConfig, setConfig }) {
  switch (type) {
    case QUESTION_TYPES.BINARY:
      return (
        <>
          <Field label="Etiqueta A">
            <input
              className="input"
              value={config.labelA || ''}
              onChange={(e) => patchConfig({ labelA: e.target.value })}
            />
          </Field>
          <Field label="Etiqueta B">
            <input
              className="input"
              value={config.labelB || ''}
              onChange={(e) => patchConfig({ labelB: e.target.value })}
            />
          </Field>
        </>
      );

    case QUESTION_TYPES.NUMBER:
      return (
        <>
          <Field label="Mínimo (opcional)">
            <input
              className="input"
              type="number"
              value={config.min ?? ''}
              onChange={(e) =>
                patchConfig({ min: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Máximo (opcional)">
            <input
              className="input"
              type="number"
              value={config.max ?? ''}
              onChange={(e) =>
                patchConfig({ max: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Placeholder">
            <input
              className="input"
              value={config.placeholder || ''}
              onChange={(e) => patchConfig({ placeholder: e.target.value })}
            />
          </Field>
        </>
      );

    case QUESTION_TYPES.TEXT:
      return (
        <>
          <Field label="Límite de caracteres">
            <input
              className="input"
              type="number"
              min={1}
              value={config.charLimit ?? ''}
              onChange={(e) =>
                patchConfig({ charLimit: e.target.value === '' ? '' : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Placeholder">
            <input
              className="input"
              value={config.placeholder || ''}
              onChange={(e) => patchConfig({ placeholder: e.target.value })}
            />
          </Field>
        </>
      );

    case QUESTION_TYPES.DROPDOWN:
      return <OptionsEditor config={config} patchConfig={patchConfig} />;

    case QUESTION_TYPES.CHECK:
      return (
        <>
          <OptionsEditor config={config} patchConfig={patchConfig} />
          <Field label="Mínimo de selecciones (opcional)">
            <input
              className="input"
              type="number"
              min={0}
              value={config.min ?? ''}
              onChange={(e) =>
                patchConfig({ min: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Máximo de selecciones (opcional)">
            <input
              className="input"
              type="number"
              min={1}
              value={config.max ?? ''}
              onChange={(e) =>
                patchConfig({ max: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
        </>
      );

    case QUESTION_TYPES.RANKING:
      return (
        <>
          <Field label="Ítems">
            {(config.items || []).map((it, i) => (
              <div className="editor-item-row" key={it.id}>
                <input
                  className="input"
                  placeholder="Etiqueta"
                  value={it.label}
                  onChange={(e) => {
                    const items = [...config.items];
                    items[i] = { ...items[i], label: e.target.value };
                    patchConfig({ items });
                  }}
                />
                <input
                  className="input"
                  placeholder="Descripción"
                  value={it.description}
                  onChange={(e) => {
                    const items = [...config.items];
                    items[i] = { ...items[i], description: e.target.value };
                    patchConfig({ items });
                  }}
                />
                <button
                  type="button"
                  className="qlist__btn qlist__btn--del"
                  onClick={() => {
                    const items = config.items.filter((_, j) => j !== i);
                    patchConfig({
                      items,
                      selectCount: Math.min(config.selectCount, items.length) || 1,
                    });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                patchConfig({
                  items: [...(config.items || []), { id: newItemId(), label: '', description: '' }],
                })
              }
            >
              + Agregar ítem
            </Button>
          </Field>
          <Field label="Cantidad a ordenar">
            <input
              className="input"
              type="number"
              min={1}
              max={(config.items || []).length}
              value={config.selectCount ?? ''}
              onChange={(e) =>
                patchConfig({ selectCount: e.target.value === '' ? '' : Number(e.target.value) })
              }
            />
          </Field>
        </>
      );

    default:
      return null;
  }
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
    </div>
  );
}

// Shared label + optional-description options editor for dropdown / check types.
// Normalizes legacy string options to { label, description } objects.
function OptionsEditor({ config, patchConfig }) {
  const options = normalizeOptions(config.options);

  function update(i, patch) {
    const next = options.map((o, j) => (j === i ? { ...o, ...patch } : o));
    patchConfig({ options: next });
  }

  return (
    <Field label="Opciones">
      {options.map((opt, i) => (
        <div className="editor-option" key={i}>
          <div className="editor-item-row">
            <input
              className="input"
              placeholder="Etiqueta"
              value={opt.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <button
              type="button"
              className="qlist__btn qlist__btn--del"
              onClick={() => patchConfig({ options: options.filter((_, j) => j !== i) })}
            >
              ✕
            </button>
          </div>
          <input
            className="input"
            placeholder="Descripción (opcional)"
            value={opt.description}
            onChange={(e) => update(i, { description: e.target.value })}
          />
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => patchConfig({ options: [...options, { label: '', description: '' }] })}
      >
        + Agregar opción
      </Button>
    </Field>
  );
}
