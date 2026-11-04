import type { Metadata } from "next";
import { Console } from "./console";

export const metadata: Metadata = { title: "Console" };

export default function AppPage() {
  return <Console />;
}
