import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Laptop,
  Shirt,
  FileText,
  Watch,
  Package,
  MapPin,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  X,
  SearchX,
  Mail,
  ImagePlus,

} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Lost & Found — Report and Find Lost Items" },
      {
        name: "description",
        content:
          "Browse lost and found items on campus, report something you lost or found, and help reunite belongings with their owners.",
      },
      { property: "og:title", content: "Campus Lost & Found — Report and Find Lost Items" },
      {
        property: "og:description",
        content:
          "Browse lost and found items on campus, report something you lost or found, and help reunite belongings with their owners.",
      },
    ],
  }),
  component: Index,
});

type Status = "Lost" | "Found" | "Claimed";
type Category = "Electronics" | "Clothing" | "Documents" | "Accessories" | "Other";

interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  status: Status;
  contact: string;
  date: string; // ISO
  photo?: string; // data URL
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

/** Read an image file, downscale it, and return a compact data URL. */
function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(String(reader.result));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}


const CATEGORIES: Category[] = ["Electronics", "Clothing", "Documents", "Accessories", "Other"];

const CATEGORY_ICON: Record<Category, typeof Laptop> = {
  Electronics: Laptop,
  Clothing: Shirt,
  Documents: FileText,
  Accessories: Watch,
  Other: Package,
};

const SEED_ITEMS: Item[] = [
  {
    id: "seed-1",
    title: "Blue Hydro Flask water bottle",
    description: "32oz blue bottle with a robotics club sticker on the side. Left it after lecture.",
    category: "Other",
    location: "Science Building, Room 204",
    status: "Lost",
    contact: "maya.r@campus.edu",
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "seed-2",
    title: "AirPods Pro case (no earbuds)",
    description: "White charging case found under a bench near the quad. Has a small scratch on the lid.",
    category: "Electronics",
    location: "Central Quad, east benches",
    status: "Found",
    contact: "555-0142",
    date: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: "seed-3",
    title: "Green campus hoodie, size M",
    description: "University hoodie with a small coffee stain on the cuff. Turned in at the front desk.",
    category: "Clothing",
    location: "Student Center front desk",
    status: "Found",
    contact: "frontdesk@campus.edu",
    date: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  },
  {
    id: "seed-4",
    title: "Student ID card — J. Park",
    description: "Found on the floor near the library printers. Can verify with student number.",
    category: "Documents",
    location: "Library, 2nd floor",
    status: "Claimed",
    contact: "lib-desk@campus.edu",
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: "seed-5",
    title: "Silver Casio watch",
    description: "Metal band, slightly worn. Lost somewhere between the gym and the parking lot.",
    category: "Accessories",
    location: "Gym / Lot C",
    status: "Lost",
    contact: "d.osei@campus.edu",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

const STORAGE_KEY = "campus-lost-found-items";

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_ITEMS;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Lost: "bg-lost text-lost-foreground",
    Found: "bg-found text-found-foreground",
    Claimed: "bg-claimed text-claimed-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function Index() {
  const [items, setItems] = useState<Item[]>(SEED_ITEMS);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (status !== "All" && item.status !== status) return false;
      if (
        q &&
        !`${item.title} ${item.description} ${item.location}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [items, query, category, status]);

  const active = filtered.filter((i) => i.status !== "Claimed");
  const resolved = filtered.filter((i) => i.status === "Claimed");

  const claimItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Claimed" } : i)));

  const addItem = (data: Omit<Item, "id" | "date">) =>
    setItems((prev) => [
      { ...data, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...prev,
    ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Campus Lost &amp; Found</h1>
              <p className="text-xs text-muted-foreground">Reuniting students with their stuff</p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Report an Item</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Search & filters */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, location…"
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "All" | Category)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-auto"
              aria-label="Filter by category"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "All" | Status)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-auto"
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No items found</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Nothing matches your search or filters. Try a different keyword, or report the item
              yourself.
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Report an Item
            </button>
          </div>
        )}

        {/* Active items grid */}
        {active.length > 0 && (
          <section aria-label="Lost and found items">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((item) => (
                <ItemCard key={item.id} item={item} onClaim={() => claimItem(item.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Resolved section */}
        {resolved.length > 0 && (
          <section aria-label="Resolved items" className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Resolved
            </h2>
            <div className="grid gap-5 opacity-70 sm:grid-cols-2 lg:grid-cols-3">
              {resolved.map((item) => (
                <ItemCard key={item.id} item={item} onClaim={() => claimItem(item.id)} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Campus Lost &amp; Found — a community board for students. No account needed.
      </footer>

      {dialogOpen && (
        <ReportDialog
          existingItems={items}
          onClose={() => setDialogOpen(false)}
          onSubmit={addItem}
        />
      )}
    </div>
  );
}

function ItemCard({ item, onClaim }: { item: Item; onClaim: () => void }) {
  const Icon = CATEGORY_ICON[item.category];
  const claimed = item.status === "Claimed";
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md ${
        claimed ? "grayscale" : ""
      }`}
    >
      {item.photo ? (
        <img
          src={item.photo}
          alt={item.title}
          loading="lazy"
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-secondary">
          <Icon className="h-12 w-12 text-primary/60" aria-label={`${item.category} icon`} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-auto space-y-1.5 pt-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {item.location}
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" /> {formatDate(item.date)}
            <span className="mx-1">·</span> {item.category}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {item.contact}
          </p>
        </div>
        {!claimed && (
          <button
            onClick={onClaim}
            className="mt-3 w-full rounded-lg border border-primary/30 bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            Mark as Claimed
          </button>
        )}
      </div>
    </article>
  );
}

function findDuplicates(form: {
  title: string;
  category: Category;
  location: string;
  status: "Lost" | "Found";
}, items: Item[]): Item[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const titleWords = norm(form.title)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  return items.filter((item) => {
    if (item.status === "Claimed") return false;
    if (item.category !== form.category) return false;
    const itemTitle = norm(item.title);
    const titleMatch =
      itemTitle === norm(form.title) ||
      (titleWords.length > 0 &&
        titleWords.some((w) => itemTitle.includes(w)) &&
        (itemTitle.includes(norm(form.title)) || norm(form.title).includes(itemTitle))) ||
      (titleWords.length > 1 &&
        titleWords.filter((w) => itemTitle.includes(w)).length >=
          Math.ceil(titleWords.length / 2));
    if (!titleMatch) return false;
    const itemLoc = norm(item.location);
    const formLoc = norm(form.location);
    return (
      itemLoc === formLoc ||
      itemLoc.includes(formLoc) ||
      formLoc.includes(itemLoc) ||
      itemLoc
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2)
        .some((w) => formLoc.includes(w))
    );
  });
}

function ReportDialog({
  existingItems,
  onClose,
  onSubmit,
}: {
  existingItems: Item[];
  onClose: () => void;
  onSubmit: (data: Omit<Item, "id" | "date">) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other" as Category,
    location: "",
    status: "Lost" as "Lost" | "Found",
    contact: "",
  });
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<Item[] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDuplicates(null);
  };

  const doSubmit = () => {
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || "No description provided.",
      category: form.category,
      location: form.location.trim(),
      status: form.status,
      contact: form.contact.trim(),
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.contact.trim()) {
      setError("Please fill in the title, location, and contact info.");
      return;
    }
    setError("");
    const dupes = findDuplicates(form, existingItems);
    if (dupes.length > 0) {
      setDuplicates(dupes);
      return;
    }
    doSubmit();
  };

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Report an item"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Report an Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="r-title">
              Title *
            </label>
            <input
              id="r-title"
              className={inputCls}
              placeholder="e.g. Black North Face backpack"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="r-desc">
              Description
            </label>
            <textarea
              id="r-desc"
              rows={3}
              className={inputCls}
              placeholder="Any identifying details…"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="r-cat">
                Category
              </label>
              <select
                id="r-cat"
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category")(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="r-status">
                Status
              </label>
              <select
                id="r-status"
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status")(e.target.value)}
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="r-loc">
              Location *
            </label>
            <input
              id="r-loc"
              className={inputCls}
              placeholder="e.g. Library, 3rd floor"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="r-contact">
              Contact info (email or phone) *
            </label>
            <input
              id="r-contact"
              className={inputCls}
              placeholder="e.g. you@campus.edu"
              value={form.contact}
              onChange={(e) => set("contact")(e.target.value)}
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {duplicates && (
            <div
              role="alert"
              className="rounded-lg border border-found/40 bg-found/10 p-4 text-sm"
            >
              <p className="font-semibold text-found-foreground">
                A similar item already exists — do you still want to submit?
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {duplicates.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">{d.title}</span>
                    <span>· {d.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Cancel
          </button>
          {duplicates ? (
            <button
              type="button"
              onClick={doSubmit}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Submit Anyway
            </button>
          ) : (
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Post Item
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
