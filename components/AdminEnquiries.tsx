"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type AdminEnquiriesProps = {
  enquiries: Enquiry[];
};

export default function AdminEnquiries({
  enquiries: initialEnquiries,
}: AdminEnquiriesProps) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(
    id: string,
    status: "new" | "read" | "replied"
  ) {
    setUpdatingId(id);

    const supabase = createClient();

    const { error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(`Failed to update enquiry: ${error.message}`);
      setUpdatingId(null);
      return;
    }

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry.id === id
          ? { ...enquiry, status }
          : enquiry
      )
    );

    setUpdatingId(null);
  }

  return (
    <div className="mt-10 space-y-4">
      {enquiries.map((enquiry) => (
        <div
          key={enquiry.id}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold">
                  {enquiry.subject}
                </h3>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    enquiry.status === "new"
                      ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
                      : enquiry.status === "read"
                        ? "border-white/15 bg-white/[0.06] text-white/60"
                        : "border-green-400/20 bg-green-400/10 text-green-300"
                  }`}
                >
                  {enquiry.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-white/70">
                {enquiry.name}
              </p>

              <p className="mt-1 text-xs text-white/40">
                {enquiry.email}
              </p>

              {enquiry.phone && (
                <p className="mt-1 text-xs text-white/40">
                  {enquiry.phone}
                </p>
              )}
            </div>

           <p className="text-xs text-white/30">
  {new Date(enquiry.created_at).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}
</p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">
              {enquiry.message}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Status
            </span>

            <button
              type="button"
              onClick={() => updateStatus(enquiry.id, "new")}
              disabled={updatingId === enquiry.id}
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                enquiry.status === "new"
                  ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                  : "border-white/10 bg-white/[0.03] text-white/40 hover:border-orange-400/30 hover:text-orange-300"
              }`}
            >
              NEW
            </button>

            <button
              type="button"
              onClick={() => updateStatus(enquiry.id, "read")}
              disabled={updatingId === enquiry.id}
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                enquiry.status === "read"
                  ? "border-white/25 bg-white/[0.08] text-white/70"
                  : "border-white/10 bg-white/[0.03] text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              READ
            </button>

            <button
              type="button"
              onClick={() => updateStatus(enquiry.id, "replied")}
              disabled={updatingId === enquiry.id}
              className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                enquiry.status === "replied"
                  ? "border-green-400/30 bg-green-400/10 text-green-300"
                  : "border-white/10 bg-white/[0.03] text-white/40 hover:border-green-400/30 hover:text-green-300"
              }`}
            >
              REPLIED
            </button>

            {updatingId === enquiry.id && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-white/30">
                Updating...
              </span>
            )}
            <button
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(enquiry.id);

    const supabase = createClient();

    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", enquiry.id);

    if (error) {
      alert(`Failed to delete enquiry: ${error.message}`);
      setUpdatingId(null);
      return;
    }

    setEnquiries((current) =>
      current.filter((item) => item.id !== enquiry.id)
    );

    setUpdatingId(null);
  }}
  disabled={updatingId === enquiry.id}
  className="
    ml-auto
    rounded-full
    border border-red-400/20
    bg-red-400/5
    px-4 py-2
    text-[10px]
    font-semibold
    uppercase
    tracking-[0.15em]
    text-red-300/70
    transition
    hover:border-red-400/40
    hover:bg-red-400/10
    hover:text-red-300
    disabled:cursor-not-allowed
    disabled:opacity-40
  "
>
  DELETE
</button>
          </div>
        </div>
      ))}
    </div>
  );
}