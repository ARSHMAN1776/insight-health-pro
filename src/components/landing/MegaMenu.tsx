import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Bone, 
  Eye, 
  Baby,
  Activity,
  FileText,
  Users,
  Clock,
  Shield,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MegaMenuProps {
  type: 'services' | 'departments' | 'patients';
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenu = ({ type, isOpen, onClose }: MegaMenuProps) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuData = {
    services: {
      items: [
        { icon: Calendar, name: "Appointments", description: "Book and manage visits", path: "/login" },
        { icon: FileText, name: "Medical Records", description: "Access your health data", path: "/login" },
        { icon: Activity, name: "Lab Results", description: "View test reports", path: "/login" },
        { icon: Shield, name: "Insurance", description: "Claims & coverage", path: "/login" },
        { icon: Clock, name: "Emergency Care", description: "24/7 urgent services", path: "/services" },
        { icon: Users, name: "Telemedicine", description: "Virtual consultations", path: "/services" },
      ]
    },
    departments: {
      items: [
        { icon: Heart, name: "Cardiology", description: "Heart & vascular care", path: "/services" },
        { icon: Brain, name: "Neurology", description: "Brain & nervous system", path: "/services" },
        { icon: Bone, name: "Orthopedics", description: "Bone & joint health", path: "/services" },
        { icon: Eye, name: "Ophthalmology", description: "Eye care services", path: "/services" },
        { icon: Baby, name: "Pediatrics", description: "Child healthcare", path: "/services" },
        { icon: Stethoscope, name: "General Medicine", description: "Primary care", path: "/services" },
      ]
    },
    patients: {
      items: [
        { icon: Calendar, name: "Book Appointment", description: "Schedule a visit", path: "/login" },
        { icon: FileText, name: "Patient Portal", description: "Access your account", path: "/login" },
        { icon: Activity, name: "Health Records", description: "View medical history", path: "/login" },
        { icon: Users, name: "Find a Doctor", description: "Browse specialists", path: "/services" },
      ]
    }
  };

  const data = menuData[type];

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[480px] bg-background border border-border rounded-lg shadow-lg p-4",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
    >
      <div className="grid grid-cols-2 gap-1">
        {data.items.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigate(item.path)}
            className="flex items-start gap-3 p-3 rounded-md hover:bg-muted transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
