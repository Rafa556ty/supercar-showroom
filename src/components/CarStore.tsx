import { useState } from 'react';
import { Coins, ShoppingBag, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORE_CARS, selectStoreCar } from '@/game/store-catalog';

export function CarStore({ onClose, chironOwned, onChiron, busy }: { onClose: () => void; chironOwned: boolean; onChiron: () => void; busy: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <section role="dialog" aria-modal="true" aria-label="Loja" className="pointer-events-auto absolute inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-hud-border px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3"><ShoppingBag className="size-6 text-primary" /><h2 className="font-display text-3xl">LOJA</h2><span className="text-xs font-bold text-primary">DEMO</span></div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar loja" title="Fechar loja"><X className="size-5" /></Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-8" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-5 border-b border-primary pb-3 font-display text-2xl text-primary">Carros grátis</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {STORE_CARS.map(car => (
              <Button key={car.id} disabled={busy} variant="outline" className="block h-auto w-full overflow-hidden rounded border-hud-border bg-card p-0 text-left text-foreground whitespace-normal hover:border-primary hover:bg-card hover:text-foreground" onClick={() => {
                if (car.id === "chiron") { onChiron(); return; }
                if (selectStoreCar(car.id).status === 'demo') setSelected(car.name);
              }} aria-label={`${car.name}, ${car.price.toLocaleString('pt-BR')} moedas`}>
                <img src={car.image} alt={car.name} loading="lazy" className="h-20 w-full bg-secondary object-cover sm:h-24" />
                <div className="flex flex-col items-start gap-1 p-2.5">
                  <span className="font-display text-base leading-tight">{car.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">{car.id === "chiron" ? (chironOwned ? "DISPONÍVEL NA GARAGEM" : "RESGATAR GRÁTIS") : <><Coins className="size-4" />{car.price.toLocaleString('pt-BR')} <span className="text-xs">moedas</span></>}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div role="alertdialog" aria-modal="true" aria-label="Loja em DEMO" className="absolute inset-0 z-10 flex items-center justify-center bg-scrim p-5">
          <div className="w-full max-w-sm rounded border border-hud-border bg-card p-6 text-center">
            <ShoppingBag className="mx-auto mb-3 size-8 text-primary" />
            <h3 className="font-display text-3xl text-primary">AINDA ESTAMOS EM DEMO</h3>
            <p className="mt-3 font-semibold">{selected}</p>
            <p className="mt-2 text-sm text-muted-foreground">Vamos implementar a loja nas próximas atualizações.</p>
            <Button variant="race" className="mt-5 w-full" onClick={() => setSelected(null)}><ChevronLeft className="size-4" />VOLTAR À LOJA</Button>
          </div>
        </div>
      )}
    </section>
  );
}