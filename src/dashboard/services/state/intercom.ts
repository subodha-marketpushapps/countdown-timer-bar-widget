import { atom } from 'recoil';

export const intercomAlignmentState = atom<'left' | 'right'>({
  key: 'intercomAlignment',
  default: 'right',
});
