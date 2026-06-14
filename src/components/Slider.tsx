interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formats the value shown on the right, e.g. "45%". */
  format?: (value: number) => string;
}

/** A labelled range slider used throughout the settings panels. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: SliderProps) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-gold-500">
        <span>{label}</span>
        <span className="text-gold-400">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
