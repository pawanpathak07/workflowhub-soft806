import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { countByStatus, labelOf, PRIORITIES, STATUSES } from '../utils.js';
import { useToast } from '../ui/Toasts.jsx';
import { useConfirm } from '../ui/ConfirmDialog.jsx';
import ItemCard from './ItemCard.jsx';
import ItemModal from './ItemModal.jsx';

export default function Board() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [modal, setModal] = useState(null); // { item?, status? }

  const load = useCallback(async () => {
    try {
      setItems(await api.listItems());
    } catch (err) {
      toast.error(`Could not load your items. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) => (!priority || i.priority === priority) && (!q || (i.title + ' ' + i.description).toLowerCase().includes(q))
    );
  }, [items, search, priority]);

  const counts = countByStatus(items);

  async function save(values) {
    if (modal.item) {
      await api.updateItem(modal.item.id, values);
      toast.success(`Item "${values.title}" was updated.`);
    } else {
      await api.createItem(values);
      toast.success(`Item "${values.title}" was created.`);
    }
    setModal(null);
    await load();
  }

  async function move(item, status) {
    try {
      await api.updateItem(item.id, { status });
      toast.success(`"${item.title}" moved to ${labelOf(STATUSES, status)}.`);
      await load();
    } catch (err) {
      toast.error(`Could not change the status. ${err.message}`);
    }
  }

  async function remove(item) {
    const ok = await confirm({
      title: 'Delete this item?',
      message: `"${item.title}" will be permanently deleted. This cannot be undone.`,
      confirmText: 'Yes, delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteItem(item.id);
      toast.success(`"${item.title}" was deleted.`);
      await load();
    } catch (err) {
      toast.error(`Could not delete the item. ${err.message}`);
    }
  }

  return (
    <div className="board-page">
      <div className="stats">
        {STATUSES.map((s) => (
          <div key={s.value} className={`stat ${s.value}`}>
            <span className="stat-num">{counts[s.value]}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
        <div className="stat total">
          <span className="stat-num">{items.length}</span>
          <span className="stat-label">Total items</span>
        </div>
      </div>

      <div className="toolbar">
        <input className="search" placeholder="Search items" aria-label="Search items" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label} priority</option>
          ))}
        </select>
        <button className="btn primary" onClick={() => setModal({})}>+ New item</button>
      </div>

      {loading ? (
        <p className="muted center">Loading your workflow&hellip;</p>
      ) : (
        <div className="columns">
          {STATUSES.map((s) => {
            const list = visible.filter((i) => i.status === s.value);
            return (
              <section key={s.value} className={`column col-${s.value}`}>
                <header>
                  <h2>{s.label}</h2>
                  <span className="count">{list.length}</span>
                </header>
                {list.length === 0 && (
                  <div className="empty">
                    <p>{items.length === 0 ? 'Nothing here yet.' : 'No matching items.'}</p>
                    <button className="text-btn" onClick={() => setModal({ status: s.value })}>+ Add one</button>
                  </div>
                )}
                {list.map((item) => (
                  <ItemCard key={item.id} item={item} onMove={move} onEdit={(i) => setModal({ item: i })} onDelete={remove} />
                ))}
              </section>
            );
          })}
        </div>
      )}

      {modal && <ItemModal item={modal.item} defaultStatus={modal.status} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
