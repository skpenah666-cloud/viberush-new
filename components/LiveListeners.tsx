"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LiveListenersProps = {
  songId: string;
};

type ListenerPresence = {
  userId: string;
  onlineAt: string;
};

export default function LiveListeners({ songId }: LiveListenersProps) {
  const [listenerCount, setListenerCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const channel = supabase.channel(`live-listeners-${songId}`, {
      config: {
        presence: {
          key: songId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<ListenerPresence>();
        const count = Object.values(state).flat().length;

        if (mounted) {
          setListenerCount(count);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data } = await supabase.auth.getUser();

          await channel.track({
            userId: data.user?.id || `guest-${crypto.randomUUID()}`,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [songId]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-950/30 px-4 py-2 text-xs font-black text-green-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
      {listenerCount} listening now
    </div>
  );
}