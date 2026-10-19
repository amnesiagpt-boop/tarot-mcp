import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";

interface Props {
  value: string;
  onValueChange(value: string): void;
  children: ReactNode;
  "aria-label": string;
  "aria-describedby"?: string;
}

/** Consistent, keyboard accessible listbox on Chromium, Firefox and Safari. */
export function ThemedSelect({ value, onValueChange, children, ...aria }: Props) {
  const options = Children.toArray(children).filter(isValidElement) as ReactElement<{ value: string; children: ReactNode }>[];
  const selected = Math.max(0, options.findIndex(option => option.props.value === value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (open) root.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);
  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onValueChange(String(option.props.value));
    setOpen(false);
    trigger.current?.focus();
  };
  return <div className="themed-select" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls={`${id}-list`} aria-activedescendant={open ? `${id}-${active}` : undefined} {...aria}
      onClick={() => { setActive(selected); setOpen(previous => !previous); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault(); setOpen(true);
          setActive(previous => event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : !open ? selected : (previous + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
        } else if ((event.key === "Enter" || event.key === " ") && open) { event.preventDefault(); choose(active); }
      }}>
      <span>{options[selected]?.props.children}</span><span aria-hidden="true">⌄</span>
    </button>
    {open && <div id={`${id}-list`} role="listbox" aria-label={aria["aria-label"]} className="themed-select__list">
      {options.map((option, index) => <button type="button" role="option" id={`${id}-${index}`} key={option.props.value} data-option-index={index} aria-selected={value === option.props.value} className={index === active ? "is-active" : undefined} tabIndex={-1} onPointerMove={() => setActive(index)} onClick={() => choose(index)}>
        <span>{option.props.children}</span><span aria-hidden="true">{value === option.props.value ? "✓" : ""}</span>
      </button>)}
    </div>}
  </div>;
}
