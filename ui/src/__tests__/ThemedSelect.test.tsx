import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemedSelect } from '../ThemedSelect.js';

function Example(){const [value,setValue]=useState('three');return <><ThemedSelect value={value} onValueChange={setValue} aria-label="Расклад"><option value="one">Карта дня</option><option value="three">Три карты</option><option value="cross">Кельтский крест</option></ThemedSelect><button>Снаружи</button></>}
describe('themed spread selector',()=>{
 it('supports keyboard opening, selection and Escape without changing selection',async()=>{
  const user=userEvent.setup();render(<Example/>);const field=screen.getByRole('combobox',{name:'Расклад'});field.focus();await user.keyboard('[ArrowDown][End][Enter]');expect(field.textContent).toContain('Кельтский крест');expect(field.getAttribute('aria-expanded')).toBe('false');await user.keyboard('[ArrowUp][Home][Escape]');expect(field.textContent).toContain('Кельтский крест');expect(screen.queryByRole('listbox')).toBeNull();
 });
 it('preserves selection on outside click and supports pointer selection',async()=>{
  const user=userEvent.setup();render(<Example/>);const field=screen.getByRole('combobox',{name:'Расклад'});await user.click(field);await user.click(screen.getByRole('option',{name:'Карта дня'}));expect(field.textContent).toContain('Карта дня');await user.click(field);await user.click(screen.getByRole('button',{name:'Снаружи'}));expect(screen.queryByRole('listbox')).toBeNull();expect(field.textContent).toContain('Карта дня');
 });
});
