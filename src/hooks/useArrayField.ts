import { useState } from 'react';

export default function useArrayField<T>(initial: T[], createItem: () => T) {
  const [items, setItems] = useState<T[]>(initial);

  const addItem = () => {
    setItems([...items, createItem()]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof T>(index: number, field: K, value: T[K]) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  return { items, addItem, removeItem, updateItem };
}
