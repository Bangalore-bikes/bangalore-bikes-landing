import type { Meta, StoryObj } from "@storybook/react";
import type { Ride } from "@/lib/rideSchema";
import { RideAvailability, RideDirectory } from "./ride-directory";

const now = Date.now();
const hour = 3600000;
const fixture: Ride = {
  slug: "preview-ride-not-published",
  title: "Example ride — preview only",
  description: "Component preview fixture, not a real event or invitation.",
  startsAt: new Date(now + 24 * hour).toISOString(),
  endsAt: new Date(now + 28 * hour).toISOString(),
  meetingPoint: "Example meeting point",
  destination: "Example destination",
  distanceKm: 40,
  organizer: "Example organizer",
  experience: "Example pace expectations",
  redditUrl: "https://www.reddit.com/r/bangalorebikes/",
  updatedAt: new Date(now).toISOString(),
  confirmed: true,
  status: "scheduled",
};
const meta = {
  title: "Community/Ride availability",
  component: RideAvailability,
  tags: ["autodocs"],
  args: { ride: fixture },
  parameters: {
    docs: {
      description: {
        component:
          "Isolated preview fixtures. These are not public ride listings.",
      },
    },
  },
} satisfies Meta<typeof RideAvailability>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Upcoming: Story = {};
export const Cancelled: Story = {
  args: {
    ride: {
      ...fixture,
      status: "cancelled",
      cancellationReason: "Example weather cancellation",
    },
  },
};
export const InProgress: Story = {
  args: {
    ride: {
      ...fixture,
      startsAt: new Date(now - hour).toISOString(),
      endsAt: new Date(now + hour).toISOString(),
    },
  },
};
export const Past: Story = {
  args: {
    ride: {
      ...fixture,
      startsAt: new Date(now - 28 * hour).toISOString(),
      endsAt: new Date(now - 24 * hour).toISOString(),
    },
  },
};
export const Directory: Story = {
  render: () => <RideDirectory rides={[fixture]} />,
};
