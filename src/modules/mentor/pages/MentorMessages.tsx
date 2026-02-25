
import React from 'react';
import { MessageSquare } from 'lucide-react';

const MentorMessages = () => {
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with your students through direct messaging</p>
      </div>
    </div>
  );
};

export default MentorMessages;
