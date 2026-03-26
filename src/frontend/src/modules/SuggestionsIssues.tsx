import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Lightbulb, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLabels } from "../contexts/UILabelsContext";
import { useActor } from "../hooks/useActor";
import { SHEET_NAMES, fetchSheetByName } from "../lib/googleSheets";

const ISSUE_CATEGORIES = [
  "FSE General Issues",
  "Brand Issues",
  "Operational Issues",
  "Other",
] as const;

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
}

const SUGGESTIONS_KV_KEY = "suggestions";
const ISSUES_KV_KEY = "issues";

function unwrapOptional<T>(val: unknown): T | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val.length > 0 ? (val[0] as T) : null;
  return val as T;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function usePersistentList<T>(kvKey: string) {
  const { actor } = useActor();
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchFromBackend = useCallback(async () => {
    if (!actor) return;
    try {
      const raw = await (actor as any).getKV(kvKey);
      const val = unwrapOptional<string>(raw);
      if (val) {
        const parsed: T[] = JSON.parse(val);
        setItems(parsed);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.warn(`[${kvKey}] KV fetch failed`, e);
    }
  }, [actor, kvKey]);

  useEffect(() => {
    if (!actor) return;
    (async () => {
      try {
        const raw = await (actor as any).getKV(kvKey);
        const val = unwrapOptional<string>(raw);
        if (val) {
          const parsed: T[] = JSON.parse(val);
          setItems(parsed);
        }
      } catch (e) {
        console.warn(`[${kvKey}] KV load failed`, e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [actor, kvKey]);

  // Poll backend KV every 30 seconds to sync across users
  useEffect(() => {
    if (!actor || !loaded) return;
    const interval = setInterval(fetchFromBackend, 30000);
    return () => clearInterval(interval);
  }, [actor, loaded, fetchFromBackend]);

  const save = useCallback(
    async (newItems: T[]) => {
      setItems(newItems); // optimistic update
      if (!actor) throw new Error("No actor available");
      await (actor as any).setKV(kvKey, JSON.stringify(newItems));
    },
    [actor, kvKey],
  );

  return { items, save, loaded, refresh: fetchFromBackend };
}

function useSheetSuggestions() {
  return useQuery({
    queryKey: ["sheet-suggestions"],
    queryFn: async () => {
      const sheet = await fetchSheetByName(SHEET_NAMES.suggestions);
      return sheet.rows
        .map((row, i) => ({
          id: `sheet_s_${i}`,
          title: row[0]?.trim() || "",
          description: row[1]?.trim() || "",
        }))
        .filter((r) => r.title);
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useSheetIssues() {
  return useQuery({
    queryKey: ["sheet-issues"],
    queryFn: async () => {
      const sheet = await fetchSheetByName(SHEET_NAMES.issues);
      return sheet.rows
        .map((row, i) => ({
          id: `sheet_i_${i}`,
          title: row[0]?.trim() || "",
          category: row[1]?.trim() || "",
          description: row[2]?.trim() || "",
        }))
        .filter((r) => r.title);
    },
    staleTime: 5 * 60 * 1000,
  });
}

function SuggestionsPanel() {
  const { labels } = useLabels();
  const {
    items: suggestions,
    save: saveSuggestions,
    loaded,
    refresh,
  } = usePersistentList<Suggestion>(SUGGESTIONS_KV_KEY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: sheetSuggestions = [] } = useSheetSuggestions();
  const allSuggestions = [...sheetSuggestions, ...suggestions];

  function handleOpen() {
    setTitle("");
    setDescription("");
    setTitleError(false);
    setDialogOpen(true);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    try {
      const newItem: Suggestion = {
        id: `s_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveSuggestions([newItem, ...suggestions]);
      setDialogOpen(false);
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {labels.suggestionsSectionHeader}
            </h2>
            <p className="text-xs text-muted-foreground">
              Ideas and suggestions from the organization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh data"
            data-ocid="suggestions.secondary_button"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-amber-700 hover:bg-amber-800 text-white"
            onClick={handleOpen}
            data-ocid="suggestions.add_button"
          >
            <Plus size={14} />
            Add Suggestion
          </Button>
        </div>
      </div>

      {!loaded ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      ) : allSuggestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb size={36} className="text-amber-300 mb-3" />
          <p className="font-medium text-sm">No suggestions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Add Suggestion&quot; to submit one
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
          {allSuggestions.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{s.title}</p>
                {s.id.startsWith("sheet_") && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">
                    Live Sheet
                  </span>
                )}
              </div>
              {s.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {s.description}
                </p>
              )}
              {"createdAt" in s && (s as any).createdAt ? (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formatDate((s as any).createdAt)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lightbulb size={17} className="text-amber-600" />
              </div>
              <div>
                <DialogTitle>Suggestions</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Ideas and suggestions from the organization
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="sugg-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sugg-title"
                placeholder="Enter suggestion title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError(false);
                }}
                className={titleError ? "border-destructive" : ""}
              />
              {titleError && (
                <p className="text-xs text-destructive">Title is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sugg-desc">Description</Label>
              <Textarea
                id="sugg-desc"
                placeholder="Describe your suggestion..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-amber-700 hover:bg-amber-800 text-white"
                onClick={handleSave}
              >
                Save Suggestion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IssuesPanel() {
  const { labels } = useLabels();
  const {
    items: issues,
    save: saveIssues,
    loaded,
    refresh,
  } = usePersistentList<Issue>(ISSUES_KV_KEY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: sheetIssues = [] } = useSheetIssues();
  const allIssues = [...sheetIssues, ...issues];

  function handleOpen() {
    setTitle("");
    setCategory("");
    setDescription("");
    setTitleError(false);
    setDialogOpen(true);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    try {
      const newItem: Issue = {
        id: `i_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: title.trim(),
        category: category || ISSUE_CATEGORIES[0],
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveIssues([newItem, ...issues]);
      setDialogOpen(false);
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {labels.issuesSectionHeader}
            </h2>
            <p className="text-xs text-muted-foreground">
              Reported FSE and operational issues
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh data"
            data-ocid="issues.secondary_button"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            onClick={handleOpen}
            data-ocid="issues.add_button"
          >
            <Plus size={14} />
            Add Issue
          </Button>
        </div>
      </div>

      {!loaded ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      ) : allIssues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-red-300 mb-3" />
          <p className="font-medium text-sm">No issues reported</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Add Issue&quot; to report one
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
          {allIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{issue.title}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {issue.id.startsWith("sheet_") && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                      Live Sheet
                    </span>
                  )}
                  {issue.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      {issue.category}
                    </span>
                  )}
                </div>
              </div>
              {issue.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {issue.description}
                </p>
              )}
              {"createdAt" in issue && (issue as any).createdAt ? (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formatDate((issue as any).createdAt)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle size={17} className="text-red-600" />
              </div>
              <div>
                <DialogTitle>Issues</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Reported FSE and operational issues
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="issue-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="issue-title"
                placeholder="Enter issue title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError(false);
                }}
                className={titleError ? "border-destructive" : ""}
              />
              {titleError && (
                <p className="text-xs text-destructive">Title is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="issue-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-desc">Description</Label>
              <Textarea
                id="issue-desc"
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSave}>
                Save Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SuggestionsIssues() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-5 min-h-[400px] flex flex-col">
        <SuggestionsPanel />
      </div>
      <div className="bg-card rounded-xl border border-border p-5 min-h-[400px] flex flex-col">
        <IssuesPanel />
      </div>
    </div>
  );
}
