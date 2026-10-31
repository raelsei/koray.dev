import type { APIRoute } from "astro";
import { siteCard } from "@/utils/og";

export const GET: APIRoute = () => siteCard();
