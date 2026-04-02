'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare } from 'lucide-react';
import { MOTION } from '@/styles/motions';
import { saveFeedback } from '@/lib/firebase';
import styles from './FeedbackModal.module.css';
import { Button } from './Button';

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
      }, MOTION.duration.slow);
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
          transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.standard }}
          className={styles.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.standard }}
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>
                <MessageSquare size={24} /> Feedback
              </h2>
              <button onClick={onClose} aria-label="Close feedback modal" className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className={styles.successState}>
                <div className={styles.iconCircle}>
                  <Send size={24} />
                </div>
                Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <p className={styles.prompt}>
                  {gameName ? `What do you think about ${gameName}?` : 'What are your thoughts on the app?'}
                  <span>Bugs, UX/UI, difficulty, features...</span>
                </p>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your feedback here..."
                  className={styles.textarea}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting || !feedbackText.trim()}
                  icon={<Send size={16} />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
