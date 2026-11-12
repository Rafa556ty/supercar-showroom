import { describe, it, expect } from 'vitest';
import { DEFAULT_GARAGE, choosePlayerCar, claimChiron, needsChironConfirmation } from './player-cars';
describe('Playable Chiron rules', () => {
  it('asks only while Chiron is not owned', () => {
    expect(needsChironConfirmation(DEFAULT_GARAGE)).toBe(true);
    expect(needsChironConfirmation(claimChiron(DEFAULT_GARAGE, true))).toBe(false);
  });
  it('does not unlock on cancellation', () => {
    expect(claimChiron(DEFAULT_GARAGE, false)).toEqual({ chironOwned: false, selectedCar: 'revuelto' });
  });
  it('confirmation unlocks and selects Chiron', () => {
    expect(claimChiron(DEFAULT_GARAGE, true)).toEqual({ chironOwned: true, selectedCar: 'chiron' });
  });
  it('cannot select Chiron before claiming', () => {
    expect(choosePlayerCar(DEFAULT_GARAGE, 'chiron').selectedCar).toBe('revuelto');
  });
  it('can return to Revuelto and select owned Chiron again', () => {
    const owned = claimChiron(DEFAULT_GARAGE, true);
    const back = choosePlayerCar(owned, 'revuelto');
    expect(back).toEqual({ chironOwned: true, selectedCar: 'revuelto' });
    expect(choosePlayerCar(back, 'chiron').selectedCar).toBe('chiron');
  });
});
import { loadGarage as _load, saveGarage as _save } from './player-cars';
describe('garage persistence', () => {
  const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };
  it('keeps the claimed Chiron selected after reload', () => { const s = mem(); _save(s, { chironOwned: true, selectedCar: 'chiron' }); expect(_load(s)).toEqual({ chironOwned: true, selectedCar: 'chiron' }); });
  it('never selects an unclaimed Chiron', () => { const s = mem(); s.setItem('garage-state-v1', JSON.stringify({ chironOwned: false, selectedCar: 'chiron' })); expect(_load(s).selectedCar).toBe('revuelto'); });
});
