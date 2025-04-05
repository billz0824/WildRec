import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { Box, Typography, Grid } from '@mui/material';

const SavedCoursesPage = () => {
  const [savedCourses, setSavedCourses] = useState([]);

  // Fetch saved courses
  useEffect(() => {
    const fetchSavedCourses = async () => {
      try {
        const response = await fetch('/api/courses/saved');
        if (response.ok) {
          const data = await response.json();
          setSavedCourses(data);
        }
      } catch (error) {
        console.error('Error fetching saved courses:', error);
      }
    };

    fetchSavedCourses();
  }, []);

  const handleUnsaveCourse = async (course) => {
    try {
      const response = await fetch(`/api/courses/unsave/${course.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unsave course');
      }

      // Remove the course from saved courses
      setSavedCourses(prev => prev.filter(c => c.id !== course.id));
    } catch (error) {
      console.error('Error unsaving course:', error);
    }
  };

  return (
    <Box sx={{ 
      ml: '240px', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0f0f0f',
      color: 'white',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}>
      {/* Fixed Header Section */}
      <Box sx={{ 
        p: 4, 
        pb: 2,
        bgcolor: '#0f0f0f',
        borderBottom: '1px solid #222'
      }}>
        <Typography variant="h4" fontWeight="bold" mb={3} color="white">
          Saved Courses
        </Typography>
      </Box>

      {/* Scrollable Course Grid */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 2
      }}>
        {savedCourses.length === 0 ? (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="gray">
              No saved courses yet
            </Typography>
            <Typography variant="body2" color="gray" mt={1}>
              Save courses from the homepage or discover page to see them here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {savedCourses.map((course) => (
              <Grid item xs={12} md={4} key={course.id} sx={{ width: '30%', padding: '8px' }}>
                <CourseCard 
                  course={course}
                  showSaveButton={true}
                  onSave={handleUnsaveCourse}
                  isSaved={true}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SavedCoursesPage;
