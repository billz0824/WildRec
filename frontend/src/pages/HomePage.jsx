import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { TextField, Box, Typography, Grid } from '@mui/material';
import { useUser } from '../context/UserContext';

// Sample course data
const sampleCourses = [
  {
    id: 1,
    number: "COMP_SCI 349",
    name: "Machine Learning",
    professor: "Dr. Bryan Pardo",
    radarData: {
      liked: 4.5,
      difficulty: 4,
      practicality: 5,
      collaborative: 3,
      rewarding: 5,
      instruction: 4
    },
    quote: "Challenging but incredibly rewarding - the projects are amazing!",
    location: "Tech L361",
    schedule: "TTH 2:00-3:20",
    prerequisites: "COMP_SCI 211, COMP_SCI 214",
    requirements: "AI/ML Breadth, Technical Elective",
    description: "Study of algorithms that improve through experience. Topics typically include Bayesian learning, decision trees, genetic algorithms, neural networks, Markov models, and reinforcement learning. Assignments include programming projects and written work.",
    saves: 45,
    comments: 23,
    shares: 12
  },
  {
    id: 2,
    number: "COMP_SCI 396",
    name: "Full-Stack Web Development",
    professor: "Dr. Sara Sood",
    radarData: {
      liked: 5,
      difficulty: 3,
      practicality: 5,
      collaborative: 4,
      rewarding: 5,
      instruction: 5
    },
    quote: "Best hands-on experience with modern web technologies!",
    location: "Mudd 3514",
    schedule: "MW 3:30-4:50",
    prerequisites: "COMP_SCI 213",
    requirements: "Systems Breadth",
    description: "Build modern web applications using React, Node.js, and other cutting-edge technologies.",
    saves: 38,
    comments: 15,
    shares: 8
  },
  {
    id: 3,
    number: "COMP_SCI 321",
    name: "Programming Languages",
    professor: "Dr. Robby Findler",
    radarData: {
      liked: 4,
      difficulty: 5,
      practicality: 4,
      collaborative: 3,
      rewarding: 4,
      instruction: 5
    },
    quote: "Mind-bending concepts that change how you think about code",
    location: "Tech L168",
    schedule: "MWF 10:00-10:50",
    prerequisites: "COMP_SCI 211",
    requirements: "Theory Breadth",
    description: "Explore different programming paradigms and the theoretical foundations of programming languages.",
    saves: 32,
    comments: 18,
    shares: 9
  },
  {
    id: 4,
    number: "COMP_SCI 330",
    name: "Human Computer Interaction",
    professor: "Dr. Eleanor O'Rourke",
    radarData: {
      liked: 5,
      difficulty: 3,
      practicality: 5,
      collaborative: 5,
      rewarding: 4,
      instruction: 5
    },
    quote: "Perfect blend of design and technical skills",
    location: "Ford ITW",
    schedule: "TTH 11:00-12:20",
    prerequisites: "None",
    requirements: "HCI Breadth, Technical Elective",
    description: "Learn to design and evaluate user interfaces through hands-on projects and user studies.",
    saves: 41,
    comments: 25,
    shares: 15
  },
  {
    id: 5,
    number: "COMP_SCI 340",
    name: "Introduction to Computer Networking",
    professor: "Dr. Peter Dinda",
    radarData: {
      liked: 4,
      difficulty: 4,
      practicality: 5,
      collaborative: 3,
      rewarding: 5,
      instruction: 4
    },
    quote: "Challenging but essential knowledge for any CS major",
    location: "Tech M345",
    schedule: "MWF 1:00-1:50",
    prerequisites: "COMP_SCI 213",
    requirements: "Systems Breadth",
    description: "Understand the fundamentals of computer networks, protocols, and distributed systems.",
    saves: 35,
    comments: 20,
    shares: 10
  }
];

const HomePage = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  // const [courses, setCourses] = useState(sampleCourses);  // Initialize with sample data
  const { userId } = useUser();
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    console.log('HomePage: userId is', userId);
    const fetchRecommendedCourses = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/users/get_recommended_courses/${userId}`);
        const data = await res.json();
        setCourses(data.courses);
      } catch (err) {
        console.error("Error fetching recommended courses:", err);
      }
    };
  
    if (userId) fetchRecommendedCourses();
  }, [userId]);
  

  const filteredCourses = courses.filter(course => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchLower) ||
      course.number.toLowerCase().includes(searchLower) ||
      course.professor.toLowerCase().includes(searchLower)
    );
  });

  const handleSaveCourse = async (course) => {
    if (!userId) {
      console.error('Cannot save course without a userId');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/save_course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id }),
      });
      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      // 1) Update the local `courses` state so that this course is flagged as saved
      setCourses((prevCourses) => {
        // Mark this course as saved
        let updatedCourses = prevCourses.map((c) => {
          if (c.id === course.id) {
            return { ...c, isSaved: true };
          }
          return c;
        });

        return updatedCourses;
      });
    } catch (error) {
      console.error('Error saving course:', error);
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
            }
          }}
        />
      </Box>

      {/* Scrollable Course Grid */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 2
      }}>
        <Grid container spacing={2}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} md={4} key={course.id} sx={{ width: '30%', padding: '8px' }}>
              <CourseCard 
                key={course.id}
                course={course}
                showSaveButton
                onSave={handleSaveCourse}
                // pass down the flag so CourseCard can highlight the icon
                isSaved={course.isSaved ?? false}
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
