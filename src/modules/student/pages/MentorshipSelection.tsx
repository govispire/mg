
import React from 'react';
import { Navigate } from 'react-router-dom';

const MentorshipSelection = () => {
  // Redirect to the new wizard
  return <Navigate to="/student/mentorship/wizard" replace />;
};

export default MentorshipSelection;
