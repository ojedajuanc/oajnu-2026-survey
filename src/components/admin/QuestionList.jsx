import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QUESTION_TYPE_LIST } from '../../config/constants.js';

function typeLabel(type) {
  return QUESTION_TYPE_LIST.find((t) => t.value === type)?.label || type;
}

function SortableRow({ q, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: q.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="qlist__item">
      <span className="qlist__handle" {...attributes} {...listeners}>
        ⠿
      </span>
      <div className="qlist__main">
        <div className="qlist__type">
          {typeLabel(q.type)}
          {q.required ? ' · obligatoria' : ''}
        </div>
        <div className="qlist__prompt">{q.prompt || '(sin enunciado)'}</div>
      </div>
      <button className="qlist__btn" type="button" onClick={() => onEdit(q.id)} title="Editar">
        ✎
      </button>
      <button
        className="qlist__btn qlist__btn--del"
        type="button"
        onClick={() => onDelete(q.id)}
        title="Eliminar"
      >
        ✕
      </button>
    </div>
  );
}

// questions: array sorted by order. onReorder(newOrderedIds).
export default function QuestionList({ questions, onEdit, onDelete, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = questions.map((q) => q.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  if (questions.length === 0) {
    return <p className="muted">Todavía no hay preguntas.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        {questions.map((q) => (
          <SortableRow key={q.id} q={q} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
