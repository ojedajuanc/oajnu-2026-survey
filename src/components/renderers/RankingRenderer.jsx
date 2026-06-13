import { useMemo } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Draggable pool chip.
function PoolChip({ item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool:${item.id}`,
    data: { itemId: item.id },
  });
  return (
    <div
      ref={setNodeRef}
      className={`chip ${isDragging ? 'chip--dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span>{item.label}</span>
      {item.description && <span className="chip__desc">{item.description}</span>}
    </div>
  );
}

// Droppable numbered slot. Holds at most one item.
function Slot({ index, item, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${index}`, data: { slotIndex: index } });
  return (
    <div ref={setNodeRef} className={`slot ${isOver ? 'slot--over' : ''}`}>
      <span className="slot__num">{index + 1}</span>
      {item ? (
        <div className="slot__filled">
          <div className="chip chip--placed">
            <span>{item.label}</span>
            {item.description && <span className="chip__desc">{item.description}</span>}
          </div>
          <button type="button" className="slot__remove" onClick={() => onRemove(index)}>
            ✕
          </button>
        </div>
      ) : (
        <span className="slot__empty">Arrastrá una opción acá</span>
      )}
    </div>
  );
}

// value: string[] of item ids (ordered, may be shorter than selectCount).
export default function RankingRenderer({ question, value, onChange }) {
  const { items, selectCount } = question.config;
  const ranked = value || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const itemsById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, [items]);

  // Build fixed-length slot array for display.
  const slots = Array.from({ length: selectCount }, (_, i) => ranked[i] || null);
  const usedIds = new Set(ranked);
  const pool = items.filter((it) => !usedIds.has(it.id));

  function placeAt(slotIndex, itemId) {
    const next = [...slots];
    // remove the item from any existing slot
    const existingIdx = next.indexOf(itemId);
    if (existingIdx !== -1) next[existingIdx] = null;
    // swap if target occupied and item came from another slot
    if (next[slotIndex] && existingIdx !== -1) {
      next[existingIdx] = next[slotIndex];
    }
    next[slotIndex] = itemId;
    onChange(next.filter(Boolean));
  }

  function removeAt(slotIndex) {
    const next = [...slots];
    next[slotIndex] = null;
    onChange(next.filter(Boolean));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const itemId = active.data.current?.itemId;
    const slotIndex = over.data.current?.slotIndex;
    if (itemId == null || slotIndex == null) return;
    placeAt(slotIndex, itemId);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="ranking__pool">
        {pool.length === 0 ? (
          <span className="slot__empty">Todas las opciones fueron ubicadas.</span>
        ) : (
          pool.map((it) => <PoolChip key={it.id} item={it} />)
        )}
      </div>
      <div className="ranking__slots">
        {slots.map((id, i) => (
          <Slot key={i} index={i} item={id ? itemsById[id] : null} onRemove={removeAt} />
        ))}
      </div>
    </DndContext>
  );
}
