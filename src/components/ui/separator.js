import React from "react";
import { cn } from "../../lib/utils";

const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => {
  const separatorStyle = {
    backgroundColor: "var(--border)", // Assuming your theme has a --border variable, or you can use a hex color
    ...(orientation === "horizontal"
      ? { height: "1px", width: "100%" }
      : { width: "1px", height: "100%" }),
  };

  return (
    <div
      ref={ref}
      className={cn("shrink-0", className)}
      style={separatorStyle}
      role="separator" // Very important for accessibility
      aria-orientation={orientation} // Very important for accessibility
      {...props}
    />
  );
});

Separator.displayName = "Separator";

export { Separator };