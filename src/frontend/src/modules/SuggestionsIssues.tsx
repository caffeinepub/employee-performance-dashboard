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
import { AlertCircle, Lightbulb, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const SUGGESTIONS_KEY = "app_suggestions";
const ISSUES_KEY = "app_issues";

function loadSuggestions(): Suggestion[] {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSuggestions(items: Suggestion[]) {
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(items));
}

function loadIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(ISSUES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIssues(items: Issue[]) {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(items));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    setSuggestions(loadSuggestions());
  }, []);

  function handleOpen() {
    setTitle("");
    setDescription("");
    setTitleError(false);
    setDialogOpen(true);
  }

  function handleSave() {
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
      const updated = [newItem, ...suggestions];
      saveSuggestions(updated);
      setSuggestions(updated);
      setDialogOpen(false);
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Suggestions</h2>
            <p className="text-xs text-muted-foreground">
              Ideas and suggestions from the organization
            </p>
          </div>
        </div>
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

      {/* List */}
      {suggestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb size={36} className="text-amber-300 mb-3" />
          <p className="font-medium text-sm">No suggestions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Suggestion" to submit one
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors"
            >
              <p className="text-sm font-medium">{s.title}</p>
              {s.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {s.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatDate(s.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    setIssues(loadIssues());
  }, []);

  function handleOpen() {
    setTitle("");
    setCategory("");
    setDescription("");
    setTitleError(false);
    setDialogOpen(true);
  }

  function handleSave() {
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
      const updated = [newItem, ...issues];
      saveIssues(updated);
      setIssues(updated);
      setDialogOpen(false);
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Issues</h2>
            <p className="text-xs text-muted-foreground">
              Reported FSE and operational issues
            </p>
          </div>
        </div>
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

      {/* List */}
      {issues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-red-300 mb-3" />
          <p className="font-medium text-sm">No issues reported</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Issue" to report one
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{issue.title}</p>
                {issue.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                    {issue.category}
                  </span>
                )}
              </div>
              {issue.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {issue.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatDate(issue.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
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
