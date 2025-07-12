import { Spinner } from "@/components/ui/spinner"

const variants = ['default', 'circle', 'pinwheel', 'circle-filled', 'ellipsis', 'ring', 'bars', 'infinite'] as const;

export function SpinnerDemo() {
  return (
    <div className="grid grid-cols-4 gap-16">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center justify-center gap-4">
          <Spinner variant={variant} />
          <span className="text-xs text-muted-foreground font-mono">{variant}</span>
        </div>
      ))}
    </div>
  );
} 