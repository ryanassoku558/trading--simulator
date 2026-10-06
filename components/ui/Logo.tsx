import { Sprout } from "lucide-react";
export default function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <Sprout size={24} />
      </span>
      <span className="logo-wordmark">
        sprout<span className="logo-period">.</span>
        <small>TRADING</small>
      </span>
    </span>
  );
}
