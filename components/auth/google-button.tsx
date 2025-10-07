"use client"

import { Button } from "@/components/ui/button"

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2 bg-transparent"
      onClick={onClick}
      aria-label="Sign in with Google"
    >
      {/* Inline Google logo SVG to avoid external asset */}
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M9 7.363h8.489c.088.47.137.96.137 1.477 0 4.18-2.8 7.16-6.53 7.16A6.996 6.996 0 0 1 1.99 9a6.996 6.996 0 0 1 9.106-6.66l-1.87 1.82A4.07 4.07 0 0 0 9 3.9 5.1 5.1 0 0 0 3.9 9 5.1 5.1 0 0 0 9 14.1c2.594 0 4.44-1.703 4.79-4.096H9V7.363Z"
        />
      </svg>
      <span className="text-sm">Sign in with Google</span>
    </Button>
  )
}
