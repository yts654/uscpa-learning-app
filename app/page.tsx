import { redirect } from "next/navigation"

// Staging: skip landing page, go straight to app
export default function RootPage() {
  redirect("/home")
}
