import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CourseCard from '../components/CourseCard';
import { useUser } from '../context/UserContext';

const SavedCoursesPage = () => {
  const { userId } = useUser();
  const [savedCourses, setSavedCourses] = useState([]);

  useEffect(() => {
    const fetchSavedCourses = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/users/${userId}/saved_courses`
        );
        if (response.ok) {
          const data = await response.json();
          // Mark each course as saved
          const coursesWithSavedFlag = data.map((course) => ({
            ...course,
            isSaved: true,
          }));
          setSavedCourses(coursesWithSavedFlag);
        }
      } catch (error) {
        console.error('Error fetching saved courses:', error);
      }
    };

    if (userId) fetchSavedCourses();
  }, [userId]);

  const handleUnsaveCourse = async (course) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/users/${userId}/unsave_course`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ course_id: course.id }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unsave course');
      }

      setSavedCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (error) {
      console.error('Error unsaving course:', error);
    }
  };

  return (
    <Box
      sx={{
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
        left: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 4, pb: 2, borderBottom: '1px solid #222' }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Saved Courses
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {savedCourses.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="gray">
              No saved courses yet
            </Typography>
            <Typography variant="body2" color="gray" mt={1}>
              Save courses from the homepage or discover page to see them here.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {savedCourses.map((course) => (
              <Grid
                item
                xs={12}
                md={4}
                key={course.id}
                sx={{ width: '30%', padding: '8px' }}
              >
                <CourseCard
                  course={course}
                  showSaveButton
                  onToggleSave={handleUnsaveCourse}
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
