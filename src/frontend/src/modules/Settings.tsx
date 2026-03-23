import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Database, Palette, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmployeeAvatar } from "../components/EmployeeAvatar";

export function Settings() {
  const [appName, setAppName] = useState("ProPerform");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <User size={16} className="text-primary" /> Profile
        </h2>
        <div className="flex items-center gap-4">
          <EmployeeAvatar name="Alex Johnson" size="lg" />
          <div>
            <p className="font-semibold text-foreground">Alex Johnson</p>
            <p className="text-sm text-muted-foreground">
              Admin · alex.johnson@company.com
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              data-ocid="settings.displayname.input"
              defaultValue="Alex Johnson"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-ocid="settings.email.input"
              type="email"
              defaultValue="alex.johnson@company.com"
            />
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Database size={16} className="text-primary" /> Application
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="appName">App Name</Label>
            <Input
              id="appName"
              data-ocid="settings.appname.input"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Items Per Page</Label>
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectTrigger data-ocid="settings.perpage.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "20", "50"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger data-ocid="settings.currency.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger data-ocid="settings.dateformat.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Bell size={16} className="text-primary" /> Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch
              data-ocid="settings.email_notifs.switch"
              checked={emailNotifs}
              onCheckedChange={setEmailNotifs}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Push Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Receive in-app push alerts
              </p>
            </div>
            <Switch
              data-ocid="settings.push_notifs.switch"
              checked={pushNotifs}
              onCheckedChange={setPushNotifs}
            />
          </div>
        </div>
      </div>

      {/* Theme placeholder */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Palette size={16} className="text-primary" /> Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">
              Toggle dark/light theme (coming soon)
            </p>
          </div>
          <Switch data-ocid="settings.darkmode.switch" disabled />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          data-ocid="settings.save.primary_button"
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Save size={14} /> Save Settings
        </Button>
      </div>
    </div>
  );
}
