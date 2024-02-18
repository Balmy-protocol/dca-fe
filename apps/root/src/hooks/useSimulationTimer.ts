import React from 'react';

function useSimulationTimer({
  simulations,
  simulationInProgress,
}: {
  simulations: number;
  simulationInProgress: boolean;
}) {
  const [timer, setTimer] = React.useState(0);
  const [timerStarted, startTimer] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    startTimer(simulationInProgress);
    if (!simulationInProgress) {
      setTimer(0);
    }
  }, [simulationInProgress]);

  React.useEffect(() => {
    if (timerStarted && timer < simulations) {
      timerRef.current = setTimeout(() => setTimer(timer + 1), 333);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  return timer;
}

export default useSimulationTimer;
