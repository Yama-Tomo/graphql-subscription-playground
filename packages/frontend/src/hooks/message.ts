import { useCallback, useEffect, useRef, useState } from 'react';

const useMessageReadStateUpdate = (updater: (readMessageIds: string[]) => void, delay = 200) => {
  const refState = useRef<{ timer?: NodeJS.Timeout; id: Set<string>; flushedIds: Set<string> }>({
    id: new Set(),
    flushedIds: new Set(),
  });

  const asyncUpdater = useCallback(
    (id: string) => {
      if (refState.current.flushedIds.has(id)) {
        return;
      }

      refState.current.id.add(id);
      if (refState.current.timer) {
        clearTimeout(refState.current.timer);
        refState.current.timer = undefined;
      }

      refState.current.timer = setTimeout(() => {
        const ids = Array.from(refState.current.id);
        updater(ids);

        const flushedIds = Array.from(refState.current.flushedIds);
        refState.current.flushedIds = new Set([...flushedIds, ...ids]);
        refState.current.id = new Set();
      }, delay);
    },
    [delay, updater]
  );

  useEffect(() => {
    return function flushWhenChangeUpdater() {
      if (!refState.current.id.size) {
        return;
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const ids = Array.from(refState.current.id);
      updater(ids);
    };
  }, [updater]);

  return asyncUpdater;
};

const useDelayedUnReadCountRender = (
  isActiveChannel: boolean,
  unReadCount: undefined | number,
  delay = 800
) => {
  const refState = useRef<NodeJS.Timeout | undefined>(undefined);
  const [state, setState] = useState<{ unReadCount?: number }>({ unReadCount: unReadCount });

  useEffect(() => {
    if (refState.current) {
      clearTimeout(refState.current);
    }

    const updateUnReadCount = () => setState((current) => ({ ...current, unReadCount }));
    if (isActiveChannel) {
      refState.current = setTimeout(updateUnReadCount, delay);
    } else {
      updateUnReadCount();
    }
  }, [isActiveChannel, unReadCount, delay]);

  useEffect(() => {
    return function clearTimerWhenUnMount() {
      if (refState.current) {
        clearTimeout(refState.current);
      }
    };
  }, []);

  return state.unReadCount;
};

export { useMessageReadStateUpdate, useDelayedUnReadCountRender };
