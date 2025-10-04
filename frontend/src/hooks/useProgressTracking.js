import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Custom hook for tracking job progress
 */
export const useProgressTracking = (jobId, getStatusFn, updateAction, completeAction, failAction, isCompleted) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId || isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Poll status every second
    intervalRef.current = setInterval(async () => {
      try {
        const response = await getStatusFn(jobId);
        const status = response.data;

        // Update progress
        dispatch(updateAction({
          progress: status.progress || 0,
          logs: status.logs || []
        }));

        // Check if completed
        if (status.state === 'completed') {
          dispatch(completeAction(status.result));
          clearInterval(intervalRef.current);
        }

        // Check if failed
        if (status.state === 'failed') {
          dispatch(failAction(status.failedReason || 'حدث خطأ'));
          clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error('Progress tracking error:', error);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, isCompleted]);
};

/**
 * Custom hook for fun facts rotation
 */
export const useFunFacts = (facts, interval = 5000) => {
  const [currentFact, setCurrentFact] = useState(facts[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % facts.length;
        setCurrentFact(facts[newIndex]);
        return newIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [facts, interval]);

  return currentFact;
};
