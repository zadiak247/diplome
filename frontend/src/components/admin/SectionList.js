import React, { useState, useEffect } from 'react';
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
import SortableSection from './SortableSection';
import './SectionList.css';

const SectionList = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered.map((s, i) => ({ ...s, display_order: i + 1 })));

    try {
      await api.put(`/sections/${active.id}/order`, {
        newOrder: newIndex + 1
      });
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      fetchSections();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту секцию?')) {
      try {
        await api.delete(`/sections/${id}`);
        await fetchSections();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Загрузка секций...</div>;
  }

  return (
    <div>
      <div className="section-list-header">
        <h2>Управление секциями</h2>
        <Link to="/manage-a1b2c3/new" className="btn btn-success">
          + Добавить секцию
        </Link>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.length === 0 ? (
            <div className="empty-state">
              <p>Секций пока нет. Создайте первую секцию!</p>
            </div>
          ) : (
            sections.map(section => (
              <SortableSection
                key={section.id}
                section={section}
                onDelete={handleDelete}
              />
            ))
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionList;