import { motion, type Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 1,
    transform: 'translateY(0px)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-10px)',
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
};
