import { cn } from "../../lib/utils"

const Badge = ({ children, className = "", variant = "default", ...props }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-800",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "border-gray-300 text-gray-700",
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export { Badge };
