import { renderHook, act } from '@testing-library/react';
import useArrayField from './useArrayField';

describe('useArrayField', () => {
  it('adds, updates, and removes items', () => {
    const { result } = renderHook(() => useArrayField<{ value: string }>([], () => ({ value: '' })));

    act(() => result.current.addItem());
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.updateItem(0, 'value', 'test'));
    expect(result.current.items[0].value).toBe('test');

    act(() => result.current.removeItem(0));
    expect(result.current.items).toHaveLength(0);
  });
});
