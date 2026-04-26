import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableServiceItem from './SortableServiceItem';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchServices = useCallback(async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex(s => s.id === active.id);
    const newIndex = services.findIndex(s => s.id === over.id);

    const reordered = arrayMove(services, oldIndex, newIndex).map((s, i) => ({
      ...s,
      display_order: i + 1
    }));
    setServices(reordered);

    try {
      await api.put(`/services/${active.id}/order`, {
        newOrder: newIndex + 1
      });
    } catch (error) {
      console.error('Error updating order:', error);
      fetchServices(); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить услугу?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (loading) return <div>Загрузка услуг...</div>;

  return (
    <div className="section-list">
      <div className="section-list-header">
        <h2>Услуги</h2>
        <Link to="/manage-a1b2c3/services/new" className="btn btn-success">
          + Добавить услугу
        </Link>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={services.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {services.length === 0 ? (
            <div className="empty-state">
              <p>Услуг пока нет. Добавьте первую!</p>
            </div>
          ) : (
            services.map(service => (
              <SortableServiceItem
                key={service.id}
                service={service}
                onDelete={handleDelete}
              />
            ))
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ServicesList;