/**
 * What is being built next.
 *
 * These are the project's own plans, not claims about any aircraft or service, so
 * nothing here needs a source — but nothing here may promise a capability the site
 * would not be allowed to show. No dates are given: this is a spare-time project and
 * a published date is a promise it cannot keep.
 */

export type RoadmapStatus = "building" | "designing" | "planned";

export const STATUS_LABEL: Record<RoadmapStatus, string> = {
  building: "In build",
  designing: "In design",
  planned: "Planned",
};

export interface RoadmapItem {
  id: string;
  title: string;
  /** One line, used as the card's subtitle. */
  summary: string;
  /** A short paragraph of detail. */
  detail: string;
  status: RoadmapStatus;
  /** Only the featured item uses these. */
  bullets?: string[];
}

/** The headline feature. Rendered large, with its own artwork. */
export const featuredRoadmapItem: RoadmapItem = {
  id: "cockpit",
  title: "Cockpit view",
  summary: "Step inside the aircraft and look out through the canopy.",
  detail:
    "Today the viewer keeps you outside the aircraft, orbiting it. Cockpit view moves the camera into the seat: canopy bows and glass framing the sky, the panel and head-up display ahead of you, and the station you picked running away down the runway. You look around by dragging, exactly as the exterior view already works.",
  status: "building",
  bullets: [
    "Camera at seat height, with the canopy framing modelled from the same geometry as the airframe",
    "Instruments drawn only from publicly published cockpit photographs and manufacturer material — representative where nothing public exists",
    "Available at any station and any time of day, so a night departure looks like one",
    "Both seats on the two-seat types",
  ],
};

/** Everything else on the list, in the order it is shown. */
export const roadmap: RoadmapItem[] = [
  {
    id: "compare",
    title: "Side-by-side scale",
    summary: "Two aircraft on one runway, at true relative size.",
    detail:
      "A Su-30MKI parked next to a Tejas says more about both of them than either specification list does. The models are already built at real scale in metres, so this is a viewer feature rather than new data.",
    status: "designing",
  },
  {
    id: "timeline",
    title: "Fleet timeline",
    summary: "Sixty years of induction, laid end to end.",
    detail:
      "Every aircraft already records when it entered service, with a source attached. Drawn as one chart, the fleet reads as a history of what the service needed and when.",
    status: "designing",
  },
  {
    id: "liveries",
    title: "Squadron schemes",
    summary: "More than one paint scheme per type.",
    detail:
      "Paint here is generated rather than painted on, so an airframe can carry any scheme its data describes. Squadron and anniversary schemes that have been publicly displayed are the obvious next use of that.",
    status: "planned",
  },
  {
    id: "world",
    title: "Aircraft beyond the IAF",
    summary: "Notable types from other air forces.",
    detail:
      "The data model already has a slot for aircraft outside the Indian Air Force. The types are not chosen and none are built — the IAF fleet comes first, and everything added later is held to the same sourcing rule.",
    status: "planned",
  },
];
