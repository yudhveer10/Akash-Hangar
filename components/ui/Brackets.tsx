/** HUD-style corner brackets, inset inside whatever they are placed over. */
export function Brackets({ className = "inset-3" }: { className?: string }) {
  const corner = "absolute h-5 w-5 border-sky-400/35";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}
