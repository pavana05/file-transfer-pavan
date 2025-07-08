import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3 w-full">
              {/* Professional Icon */}
              <ToastIcon variant={variant} />
              
              {/* Content */}
              <div className="flex-1 grid gap-1 min-w-0">
                {title && (
                  <ToastTitle className="pr-6">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="pr-6">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            
            {/* Action button if provided */}
            {action}
            
            {/* Enhanced close button */}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
