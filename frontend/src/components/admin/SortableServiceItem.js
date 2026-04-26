import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableServiceItem = ({ service, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="section-item">
      <div className="section-info">
        <div className="section-main-row">
          <div {...attributes} {...listeners} className="drag-handle">
            ≡
          </div>
          <strong>{service.name}</strong>
          {service.price && (
            <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>
              {service.price} ₽
            </span>
          )}
          <span className={`badge ${service.is_active ? 'badge-active' : 'badge-inactive'}`}>
            {service.is_active ? 'Активна' : 'Скрыта'}
          </span>
        </div>
        <p className="section-meta">
          Порядок: {service.display_order} &nbsp;|&nbsp;
          Создал: {service.created_by_email || '—'} &nbsp;|&nbsp;
          Обновил: {service.updated_by_email || '—'}
        </p>
      </div>
      <div className="section-actions">
        <Link to={`/manage-a1b2c3/services/edit/${service.id}`} className="btn btn-primary">
          Ред.
        </Link>
        <button onClick={() => onDelete(service.id)} className="btn btn-danger">
          Удалить
        </button>
      </div>
    </div>
  );
};

export default SortableServiceItem;