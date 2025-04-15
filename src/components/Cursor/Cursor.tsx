import CursorSVG from "../../assets/CursorSVG";

type Props = {
  variant?: "basic" | "name"; 
  color: string;
  x: number; 
  y: number; 
  message?: string; 
  name?: string; 
};

const Cursor = ({ color, x, y, message, name, variant = "basic" }: Props) => (
  <div
    className="pointer-events-none absolute left-0 top-0"
    style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
  >
    {/* Cursor SVG */}
    <CursorSVG color={color} />

    {/* Display message if provided */}
    {message && (
      <div
        className="absolute left-2 top-5 rounded-3xl px-4 py-2"
        style={{
          backgroundColor: color,
          borderRadius: 20,
          transform: `translateX(${x}px) translateY(${y}px)`,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        }}
      >
        <p className="whitespace-nowrap text-sm leading-relaxed text-white">
          {message}
        </p>
      </div>
    )}

    {name && message === null && (
      <div
        className="absolute left-2 top-10 rounded-3xl px-4 py-1"
        style={{ backgroundColor: color, borderRadius: 20 }}
      >
        <p className="whitespace-nowrap text-xs leading-relaxed text-white">
          {name}
        </p>
      </div>
    )}
  </div>
);

export default Cursor;
