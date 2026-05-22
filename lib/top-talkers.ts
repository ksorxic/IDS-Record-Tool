import type { TopTalkerSnapshot } from "@/lib/admin-types";

export function extractTopTalkersFromSnapshots(
  snapshots: TopTalkerSnapshot[]
): TopTalkerSnapshot[] {
  const latestSnapshotWithItems = snapshots.find(
    (snapshot) => (snapshot.metadata?.items?.length ?? 0) > 0
  );

  if (!latestSnapshotWithItems?.metadata?.items) {
    return [];
  }

  return latestSnapshotWithItems.metadata.items.map((item, index) => ({
    _id: `${latestSnapshotWithItems._id}-${index}`,
    ip: item.ip,
    bytes: item.totalBytes,
    timestamp: latestSnapshotWithItems.timestamp,
    title: latestSnapshotWithItems.title
  }));
}
