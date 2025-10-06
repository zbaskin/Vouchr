// src/components/Settings.tsx
import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";
import { SortType } from "../API";
import { fetchSortType, updateSortType } from "../ticketService";

export default function Settings() {
  const { ticketCollection } = useOutletContext<AppOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState<SortType>(SortType.TIME_CREATED);

  // Load sort preference
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!ticketCollection) return;
        const urlSort = (searchParams.get("sort") || "").toUpperCase();
        const urlEnum =
          urlSort === "ALPHABETICAL" ? SortType.ALPHABETICAL :
          urlSort === "EVENT_DATE"   ? SortType.EVENT_DATE   :
          urlSort === "TIME_CREATED" ? SortType.TIME_CREATED : undefined;

        const server = await fetchSortType(ticketCollection);
        const effective = urlEnum ?? server ?? SortType.TIME_CREATED;
        if (!cancelled) setSort(effective);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticketCollection]);

  const handleSaveSort = async () => {
    if (!ticketCollection) return;
    setSaving(true);
    try {
      await updateSortType(ticketCollection, sort);
      const sp = new URLSearchParams(searchParams);
      sp.set("sort", sort);
      setSearchParams(sp, { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Quick preferences for your collection.</p>

      {!ticketCollection ? (
        <div className="mt-6 rounded border p-4 text-sm">
          We couldn’t find your ticket collection ID. Try signing out and back in.
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Sort preference */}
          <section className="rounded border">
            <header className="border-b px-4 py-3">
              <h2 className="text-base font-medium">Sort preference</h2>
              <p className="text-xs text-gray-500">Choose how your tickets are ordered.</p>
            </header>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              ) : (
                <>
                  <Radio
                    id="sort-time"
                    name="sort"
                    checked={sort === SortType.TIME_CREATED}
                    onChange={() => setSort(SortType.TIME_CREATED)}
                    label="Time added (newest first)"
                    hint="Newest saved tickets appear first."
                  />
                  <Radio
                    id="sort-event"
                    name="sort"
                    checked={sort === SortType.EVENT_DATE}
                    onChange={() => setSort(SortType.EVENT_DATE)}
                    label="Event date (newest first)"
                    hint="Order by the event’s date/time."
                  />
                  <Radio
                    id="sort-alpha"
                    name="sort"
                    checked={sort === SortType.ALPHABETICAL}
                    onChange={() => setSort(SortType.ALPHABETICAL)}
                    label="Alphabetical (A → Z)"
                    hint="Sort by ticket name."
                  />
                  <div className="pt-1">
                    <button
                      onClick={handleSaveSort}
                      disabled={saving}
                      className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save preference"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* --- tiny presentational bits --- */

function Radio(props: {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={props.id} className="flex cursor-pointer items-start gap-3">
      <input id={props.id} type="radio" name={props.name} checked={props.checked} onChange={props.onChange} className="mt-1" />
      <div>
        <div className="text-sm font-medium">{props.label}</div>
        {props.hint ? <div className="text-xs text-gray-500">{props.hint}</div> : null}
      </div>
    </label>
  );
}
