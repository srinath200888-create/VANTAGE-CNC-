import { useState, useEffect } from 'react';
import { machineStore, GlobalState } from './MachineStateStore';
import { Machine, MachineId } from '../types';

export function useMachineStore(): GlobalState {
  const [state, setState] = useState<GlobalState>(() => machineStore.getState());

  useEffect(() => {
    return machineStore.subscribe(() => {
      setState({ ...machineStore.getState() });
    });
  }, []);

  return state;
}

export function useSelectedMachine(): Machine {
  const [machine, setMachine] = useState<Machine>(() => {
    const s = machineStore.getState();
    return s.machines[s.selectedMachineId] || Object.values(s.machines)[0];
  });

  useEffect(() => {
    return machineStore.subscribe(() => {
      const s = machineStore.getState();
      const current = s.machines[s.selectedMachineId];
      if (current) setMachine(current);
    });
  }, []);

  return machine;
}
