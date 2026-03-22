'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare } from 'lucide-react';
import { saveFeedback } from '@/lib/firebase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName?: string;
  userId?: string;
}

export function FeedbackModal({ isOpen, onClose, gameName, userId }: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await saveFeedback(userId, feedbackText, gameName);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedbackText('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#F5F2ED] border-[2px] border-[#1A1A1A] rounded-xl p-6 max-w-sm w-full shadow-[8px_8px_0px_#1A1A1A]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-black uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Feedback
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-neutral-200 rounded-sm transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {submitted ? (
              <div className="py-8 text-center text-emerald-600 font-bold flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <Send className="w-6 h-6" />
                </div>
                Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm font-medium text-neutral-600">
                  {gameName ? `What do you think about ${gameName}?` : 'What are your thoughts on the app?'}
                  <br />
                  <span className="text-xs">Bugs, UX/UI, difficulty, features...</span>
                </p>
                
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your feedback here..."
                  className="w-full h-32 p-3 bg-white border-[1.5px] border-[#1A1A1A] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium"
                  required
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full py-3 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Feedback</>}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
