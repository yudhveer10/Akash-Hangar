import type { Aircraft } from "@/lib/types";
import { su30mki } from "./su-30mki";
import { tejas } from "./tejas";
import { rafale } from "./rafale";
import { mig29upg } from "./mig-29upg";
import { mirage2000 } from "./mirage-2000";
import { jaguar } from "./jaguar";
import { prachand } from "./prachand";
import { dhruv } from "./dhruv";
import { apache } from "./apache-ah-64e";
import { chinook } from "./chinook-ch-47f";
import { c17 } from "./c-17-globemaster-iii";
import { c130j } from "./c-130j-super-hercules";

/**
 * Display order: fighters, then rotary wing, then transports. This is the order
 * the fleet gallery renders in, so it is deliberate rather than alphabetical.
 */
export const aircraft: Aircraft[] = [
  su30mki,
  rafale,
  tejas,
  mig29upg,
  mirage2000,
  jaguar,
  prachand,
  apache,
  dhruv,
  chinook,
  c17,
  c130j,
];
