export type PlayerCar = 'revuelto' | 'chiron';
export type GarageState = { chironOwned: boolean; selectedCar: PlayerCar };
export const DEFAULT_GARAGE: GarageState = { chironOwned: false, selectedCar: 'revuelto' };
export function choosePlayerCar(state: GarageState, car: PlayerCar): GarageState {
  return car === 'chiron' && !state.chironOwned ? state : { ...state, selectedCar: car };
}
export function claimChiron(state: GarageState, confirmed: boolean): GarageState {
  return confirmed ? { chironOwned: true, selectedCar: 'chiron' } : state;
}
export function needsChironConfirmation(state: GarageState) { return !state.chironOwned; }
const GARAGE_KEY = "garage-state-v1";
type KV = Pick<Storage, "getItem" | "setItem">;
export function loadGarage(store: KV): GarageState {
  try {
    const raw = JSON.parse(store.getItem(GARAGE_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return DEFAULT_GARAGE;
    const chironOwned = raw.chironOwned === true;
    return { chironOwned, selectedCar: chironOwned && raw.selectedCar === "chiron" ? "chiron" : "revuelto" };
  } catch { return DEFAULT_GARAGE; }
}
export function saveGarage(store: KV, state: GarageState) { store.setItem(GARAGE_KEY, JSON.stringify(state)); }
