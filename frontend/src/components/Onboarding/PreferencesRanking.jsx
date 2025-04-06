import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Typography, Button } from '@mui/material';
import { FaGripVertical } from 'react-icons/fa';

const SortableItem = ({ id, label, index, count }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: isDragging ? 'rgba(124, 58, 237, 0.1)' : '#1e1e1e',
        border: '1px solid',
        borderColor: isDragging ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.1)',
        boxShadow: isDragging ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#2a2a2a',
          borderColor: 'rgba(168, 85, 247, 0.2)',
        },
      }}
      {...attributes}
    >
      <Box
        {...listeners}
        sx={{
          mr: 2,
          color: 'rgba(255, 255, 255, 0.5)',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          '&:hover': {
            color: '#a855f7',
          },
        }}
      >
        <FaGripVertical size={20} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
          {label}
          {index === 0 && (
            <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: '#a855f7' }}>
              (Most Important)
            </Typography>
          )}
          {index === count - 1 && (
            <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              (Least Important)
            </Typography>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

const PreferencesRanking = ({ next, back }) => {
  const { updatePreferences } = useUser();
  const [items, setItems] = useState([
    { id: 'likedByStudents', label: 'Liked by Students' },
    { id: 'intellectuallyChallenging', label: 'Intellectually Challenging' },
    { id: 'practicality', label: 'Practicality' },
    { id: 'collaborative', label: 'Collaborative' },
    { id: 'rewarding', label: 'Rewarding' },
    { id: 'qualityOfInstruction', label: 'Quality of Instruction' }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleNext = () => {
    const preferences = items.reduce((acc, item, index) => {
      acc[item.id] = 6 - index;
      return acc;
    }, {});

    updatePreferences({ coursePreferences: preferences });
    next();
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        mx: 'auto',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          textAlign: 'center',
          mb: 1,
          background: 'linear-gradient(to right, #a855f7, #7c3aed)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        What matters most to you?
      </Typography>

      <Typography 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem',
          maxWidth: '400px'
        }}
      >
        Drag to rank these factors from most important to least important
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                label={item.label}
                index={index}
                count={items.length}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 4,
          width: '100%',
          maxWidth: '400px',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={back}
          variant="contained"
          sx={{
            bgcolor: '#2a2a2a',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#3a3a3a',
            },
          }}
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          variant="contained"
          sx={{
            bgcolor: '#7c3aed',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            '&:hover': {
              bgcolor: '#6d28d9',
              boxShadow: '0 4px 25px rgba(168, 85, 247, 0.3)',
            },
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default PreferencesRanking; 