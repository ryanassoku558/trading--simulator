import { Sprout } from "lucide-react";
export default function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <Sprout size={24} />
      </span>
      sprout<span className="logo-period">.</span>
    </span>
  );
}
