import { dueState, formatDate, labelOf, PRIORITIES, STATUSES } from '../utils.js';

const ORDER = STATUSES.map((s) => s.value);

export default function ItemCard({ item, onMove, onEdit, onDelete }) {
  const idx = ORDER.indexOf(item.status);
  const due = dueState(item.due_date, item.status === 'completed');
  const dueText = { overdue: 'Overdue', today: 'Due today', soon: 'Due soon', later: 'Due', none: 'Due' }[due];

  return (
    <article className={`card priority-${item.priority}`}>
      <div className="card-top">
        <span className={`chip prio-${item.priority}`}>{labelOf(PRIORITIES, item.priority)}</span>
        {item.due_date && (
          <span className={`due ${due}`}>
            {dueText} {formatDate(item.due_date)}
          </span>
        )}
      </div>
      <h3>{item.title}</h3>
      {item.description && <p className="desc">{item.description}</p>}
      <div className="card-actions">
        <button className="icon-btn" disabled={idx <= 0} title="Move back" aria-label={`Move ${item.title} back`} onClick={() => onMove(item, ORDER[idx - 1])}>
          &larr;
        </button>
        <button className="icon-btn" disabled={idx >= ORDER.length - 1} title="Move forward" aria-label={`Move ${item.title} forward`} onClick={() => onMove(item, ORDER[idx + 1])}>
          &rarr;
        </button>
        <span className="spacer" />
        <button className="text-btn" onClick={() => onEdit(item)}>Edit</button>
        <button className="text-btn danger" onClick={() => onDelete(item)}>Delete</button>
      </div>
    </article>
  );
}
