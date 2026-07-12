"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SkillCard } from "@/components/skill-card";
import { cn } from "@/lib/utils";
import { CATEGORIES, type SampleSkill } from "@/lib/sample-data";

type SortKey = "popular" | "recent" | "safest";

const TIER_RANK: Record<string, number> = {
  verified_safe: 0,
  caution: 1,
  blocked: 2,
  pending: 3,
};

export function Catalog({ skills }: { skills: SampleSkill[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<SortKey>("popular");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = skills.filter((s) => {
      const matchesCategory = category === "All" || s.category === category;
      const matchesQuery =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.author.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    list = [...list].sort((a, b) => {
      if (sort === "popular") return b.installs - a.installs;
      if (sort === "recent")
        return b.updatedAt.localeCompare(a.updatedAt);
      return TIER_RANK[a.trustTier] - TIER_RANK[b.trustTier];
    });

    return list;
  }, [skills, query, category, sort]);

  return (
    <div>
      {/* search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, authors, or use cases"
            className="pl-9"
            aria-label="Search skills"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="size-4 text-muted-foreground"
            aria-hidden
          />
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {(
              [
                ["popular", "Popular"],
                ["recent", "Recent"],
                ["safest", "Safest"],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  sort === key
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              category === c
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* results */}
      <p className="mt-6 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "skill" : "skills"}
        {category !== "All" ? ` in ${category}` : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="text-sm font-medium text-foreground">
            No skills match that search.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or clear the category filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
