"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Role } from "../types/role";

export function useRoles(enabled: boolean) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("roles").select("*");

      if (!error && data) {
        setRoles(data);
      }
      setLoading(false);
    };
    fetchRoles();
  }, [enabled]);
  return { roles, loading };
}
