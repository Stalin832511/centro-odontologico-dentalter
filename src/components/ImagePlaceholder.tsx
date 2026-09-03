import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label?: string;
  className?: string;
  rounded?: string;
}

export default function ImagePlaceholder({
  label = "Imagen referencial",
  className = "",
  rounded = "rounded-2xl",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`
        relative overflow-hidden ${rounded}
        bg-gradient-to-br from-cyan-50 to-slate-100
        border border-slate-200
        flex items-center justify-center
        ${className}
      `}
    >
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <ImageIcon size={28} strokeWidth={1.5} />
        <span className="text-[10px] font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
