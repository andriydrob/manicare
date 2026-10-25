import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function PhotoSlot({
  src,
  alt,
  className = "",
  style,
  children,
}: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  const hasPhoto = src && src.trim() !== "";

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {hasPhoto && !failed && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {(!hasPhoto || failed) && children}
    </div>
  );
}
