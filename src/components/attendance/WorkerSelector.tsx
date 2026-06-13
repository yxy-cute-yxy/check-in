import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Worker } from '@/types';

interface Props {
  workers: Worker[];
  value: string | null;
  onChange: (workerId: string) => void;
}

export function WorkerSelector({ workers, value, onChange }: Props) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-full bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
        <SelectValue placeholder="选择工人..." />
      </SelectTrigger>
      <SelectContent>
        {workers.map((w) => (
          <SelectItem key={w.id} value={w.id}>
            {w.name} — {w.trade} · {w.team}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
