"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "../actions";
import { FloppyDisk } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import Image from "next/image";

export default function UserForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    isActive?: boolean;
    avatar?: string | null;
  } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isNew = userId === "new";
  
  const [isActive, setIsActive] = useState(initialData ? (initialData.isActive ?? true) : true);
  const [role, setRole] = useState(initialData?.role || "EDITOR");
  const [avatar, setAvatar] = useState(initialData?.avatar || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("isActive", isActive.toString());
    formData.set("role", role);
    formData.set("avatar", avatar);
    
    startTransition(async () => {
      const res = await saveUser(userId, formData);
      if (res.success) {
        toast.success("User saved successfully!");
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-medium">User Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2 pb-4 border-b border-border">
            <Label>Avatar / Profile Picture</Label>
            {avatar ? (
              <div className="relative aspect-square w-[120px] overflow-hidden rounded-full border border-border bg-slate-50">
                <Image src={avatar} alt="Avatar" fill className="object-cover" sizes="120px" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute right-0 top-0 h-6 w-6 rounded-full"
                  onClick={() => setAvatar("")}
                >
                  <span className="text-xs">X</span>
                </Button>
              </div>
            ) : (
              <div className="w-[120px]">
                <ImageUploader
                  onUploadSuccess={(media) => setAvatar(media.url)}
                  categoryId="users"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              type="text"
              name="name"
              defaultValue={initialData?.name || ""}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              name="email"
              defaultValue={initialData?.email || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Password {isNew ? "" : <span className="text-muted-foreground font-normal">(Leave blank to keep current)</span>}
            </Label>
            <Input
              type="password"
              name="password"
              required={isNew}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border mt-6">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive" className="font-normal">Account Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/users")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <FloppyDisk className="mr-2 h-4 w-4" weight="fill" />
          {isPending ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
}
