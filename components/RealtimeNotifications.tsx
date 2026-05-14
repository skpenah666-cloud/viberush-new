"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NotificationPayload = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link?: string | null;
  is_read?: boolean;
  created_at?: string;
};

export default function RealtimeNotifications() {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as NotificationPayload;

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("viberush-notification", {
                  detail: notification,
                })
              );
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return null;
}