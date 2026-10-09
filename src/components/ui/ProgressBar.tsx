export function ProgressBar({ value, color = "#5e83aa" }: { value: number; color?: string }) {
  return <div className="h-2 overflow-hidden rounded-full bg-[#e9eff5]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} /></div>;
}
