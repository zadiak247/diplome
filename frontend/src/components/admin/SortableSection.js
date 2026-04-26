import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './SortableSection.css';

const SortableSection = ({ section, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const typeClass = `badge-${section.type}`;
  const activeClass = section.is_active ? 'badge-active' : 'badge-inactive';

  return (
    <div ref={setNodeRef} style={style} className="section-item">
      <div className="section-info">
        <div className="section-main-row">
          <div {...attributes} {...listeners} className="drag-handle">
            ≡
          </div>
          <h4 className="section-title">{section.title}</h4>
          <span className={`badge ${typeClass}`}>{section.type}</span>
          <span className={`badge ${activeClass}`}>
            {section.is_active ? 'Активна' : 'Неактивна'}
          </span>
        </div>
        <p className="section-meta">
          Порядок: {section.display_order} &nbsp;|&nbsp;
          Создал: {section.created_by_email || '—'} &nbsp;|&nbsp;
          Обновил: {section.updated_by_email || '—'}
        </p>
      </div>
      <div className="section-actions">
        <Link to={`/manage-a1b2c3/edit/${section.id}`} className="btn btn-primary">
          Ред.
        </Link>
        <button
          onClick={() => onDelete(section.id)}
          className="btn btn-danger"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default SortableSection;