import { Icon, type IconName } from "@/components/ui/icon";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: IconName;
  type?: "button" | "submit";
};

/** A primary action is a solid ink rectangle with letterspaced caps, the shop
 *  sign rather than a pill. */
export function PillButton({ children, onClick, href, disabled, icon, type = "button" }: Props) {
  const cls =
    "inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-7 text-[12.5px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood disabled:opacity-40 disabled:hover:bg-ink";
  const inner = (
    <>
      {children}
      {icon ? <Icon name={icon} className="text-sm" /> : null}
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
