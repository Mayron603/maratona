import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center cursor-pointer", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary bg-gray-200">
      <SliderPrimitive.Range className="absolute h-full bg-primary bg-purple-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      // CORREÇÃO AQUI: Usei 'transition-all' em vez de colors/transform separados
      className="block h-5 w-5 rounded-full border-2 border-purple-600 bg-white ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-110" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }