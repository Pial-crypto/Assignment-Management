import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ShieldCheck } from "lucide-react";
interface AdminHeaderProps {
//   title: string;
//   role: string;
  userName?: string;
  onLogout: () => void;
//   icon?: React.ReactNode;
}
export function AdminHeader({
userName,onLogout
}:AdminHeaderProps){

return(
      <DashboardHeader
  title="Admin Dashboard"
  role="Admin"
  userName={userName}
  onLogout={onLogout}
  icon={<ShieldCheck className="h-5 w-5" />}
/>
)
}