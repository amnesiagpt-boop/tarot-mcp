import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

/** English scenario fixtures explicitly choose English; the product default stays Russian. */
export function renderEnglish(ui: ReactNode) {
 const result=render(ui);
 const language=screen.queryByRole('combobox',{name:'Язык'});
 if(language){fireEvent.keyDown(language,{key:'End'});fireEvent.keyDown(language,{key:'Enter'});}
 return result;
}
