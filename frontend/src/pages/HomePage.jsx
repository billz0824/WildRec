// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { TextField, Box, Typography, Grid } from '@mui/material';
import { useUser } from '../context/UserContext';
import CourseCard from '../components/CourseCard';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const { userId } = useUser();

  useEffect(() => {
    // 1) Fetch recommended or all courses
    const fetchRecommendedCourses = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/users/get_recommended_courses/${userId}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching recommended courses:", err);
      }
    };

    if (userId) {
      fetchRecommendedCourses();
    }
  }, [userId]);

  useEffect(() => {
    // 2) Once we have userId, also fetch the user's saved courses
    const fetchSavedCourses = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}/saved_courses`);
        const savedData = await res.json(); // an array of saved courses
        const savedIds = new Set(savedData.map((c) => c.id));

        // 3) Merge: for any course in "courses" that appears in savedIds, set isSaved = true
        setCourses((prevCourses) =>
          prevCourses.map((course) => ({
            ...course,
            isSaved: savedIds.has(course.id),
          }))
        );
      } catch (err) {
        console.error("Error fetching saved courses:", err);
      }
    };

    fetchSavedCourses();
  }, [userId]);

  // Filter logic
  const filteredCourses = courses.filter((course) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchLower) ||
      course.number.toLowerCase().includes(searchLower) ||
      course.professor.toLowerCase().includes(searchLower)
    );
  });

  // Toggle Save (used by the CourseCard)
  const toggleSaveCourse = async (course) => {
    if (!userId) return console.error('No userId, cannot toggle save.');

    // Decide whether to call save_course or unsave_course
    const endpoint = course.isSaved ? 'unsave_course' : 'save_course';
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id })
      });
      if (!res.ok) {
        throw new Error(`Failed to ${endpoint} course`);
      }

      // Flip the isSaved flag in our local state
      setCourses((prev) =>
        prev.map((c) => 
          c.id === course.id ? { ...c, isSaved: !c.isSaved } : c
        )
      );
    } catch (error) {
      console.error('Error toggling save status:', error);
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
      {/* Header */}
      <Box sx={{ 
        p: 4, 
        pb: 2,
        bgcolor: '#0f0f0f',
        borderBottom: '1px solid #222'
      }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          All Courses
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search by course name, number, or professor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ 
            maxWidth: 600,
            mb: 2,
            input: { color: 'white' }, 
            '& .MuiOutlinedInput-root': {
              bgcolor: '#1f1f1f',
              borderColor: '#555',
              '& fieldset': { borderColor: '#444' },
              '&:hover fieldset': { borderColor: '#888' },
            }}}
        />
      </Box>

      {/* Course List */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 2
      }}>
        <Grid container spacing={2}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} md={4} key={course.id} sx={{ width: '30%', padding: '8px' }}>
              <CourseCard 
                course={course}
                showSaveButton
                onToggleSave={toggleSaveCourse}
              />
            </Grid>
          ))}
        </Grid>

        {filteredCourses.length === 0 && (
          <Typography variant="body2" color="gray" align="center" mt={4}>
            No courses found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
