import {
  useEffect,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";
import { classNames } from "../../utils/format";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Chiều cao tối thiểu (px). Mặc định theo rows hoặc 72. */
  minHeight?: number;
};

/**
 * Textarea tự giãn theo nội dung — không cần cuộn trong ô để đọc hết.
 */
export function AutoResizeTextarea({
  className,
  value,
  minHeight,
  rows = 2,
  onChange,
  ...rest
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    const min =
      minHeight ??
      Math.max(48, rows * 22 + 20);
    el.style.height = "auto";
    el.style.height = `${Math.max(min, el.scrollHeight)}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value, rows, minHeight]);

  useEffect(() => {
    const onWin = () => resize();
    window.addEventListener("resize", onWin);
    return () => window.removeEventListener("resize", onWin);
  }, []);

  return (
    <textarea
      {...rest}
      ref={ref}
      rows={rows}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        requestAnimationFrame(resize);
      }}
      className={classNames(
        "resize-none overflow-hidden",
        className
      )}
    />
  );
}
