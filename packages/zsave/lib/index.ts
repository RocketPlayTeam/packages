import { useEffect, useState } from 'react';

export default function useZSave<T = any> (props: {
  original: any;
  onSave: (updates: Partial<T>) => (boolean|Promise<boolean>);
  onEdit?: (key: keyof T, value: T[keyof T]) => (any|Promise<any>);
  autoSave?: number;
}): {
  edit: (k: keyof T, v: T[keyof T]) => void;
  save: () => Promise<void>;
  reset: () => void;
  value: T;
  changes: Partial<T>;
  pendingChanges: boolean;
} {
  const [value, setValue] = useState<any>({});
  const [snapshot, setSnapshot] = useState<string>('');
  const [pendingChanges, setPC] = useState(false);
  const [changes, setChanges] = useState<Partial<T>>({});
  const [to, setTo] = useState<any>();
  useEffect(() => {
    setSnapshot(JSON.stringify(props.original));
    setValue(props.original);
  }, [props.original]);
  useEffect(() => {
    const snapNow = JSON.stringify(value);
    const sameText = snapshot === snapNow;
    const sameLength = snapNow?.length === snapshot?.length;
    setPC(!sameLength && !sameText);
  }, [value, snapshot]);
  const edit = (key: keyof T, v: any) => {
    if (props.autoSave || to) {
      clearTimeout(to);
      setTo(undefined);
    }
    setValue((value) => {
      value[key] = v;
      try {
        const original = JSON.parse(snapshot)
        const newChanges = {...changes};
        for (const key in value) {
          if (original[key] !== value[key]) newChanges[key] = value[key];
        }
        setChanges(newChanges);
        if (props.autoSave) setTo(setTimeout(() => save(), props.autoSave));
      } catch (error) {}
      return value;
    });
  }
  useEffect(() => {
    try {
      const original = JSON.parse(snapshot)
      const newChanges = {...changes};
      for (const key in value) {
        if (original[key] !== value[key]) newChanges[key] = value[key];
      }
      setChanges(newChanges);
    } catch (e) {}
  }, [value, snapshot]);
  const save = async () => {
    let r = true;
    try {
      r = await props.onSave(changes);
    } catch (e) {
      r = false;
    }
    if (r) {
      setSnapshot(JSON.stringify(value));
      setChanges({});
    }
  }
  const reset = async () => {
    const original = JSON.parse(snapshot)
    setValue(original);
  }
  return {
    edit,
    changes,
    save,
    reset,
    value,
    pendingChanges
  };
}