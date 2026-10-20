import { Icon, type IconName } from "@/components/ui/icon";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: IconName;
  type?: "button" | "submit";
};

export function PillButton({ children, onClick, href, disabled, icon, type = "button" }: Props) {
  const cls =
    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-vermilion disabled:opacity-40 disabled:hover:bg-ink";
  const inner = (
    <>
      {children}
      {icon ? <Icon name={icon} className="text-base" /> : null}
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
