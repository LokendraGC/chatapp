"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../dialog";
import { Button } from "../../button";
import { Plus, Trash } from "lucide-react";
import { Badge } from "../../badge";
import { Label } from "../../label";
import { Input } from "../../input";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  user_email: string;
  image?: string;
  status?: string;
  role?: string;
}

export default function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/team/fetch");
      const data = await response.json();
      setTeam(data.teamMembers);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddMember = async () => {
    try {
      if (!newMemberName || !newMemberEmail) {
        toast.error("Please enter a name and email");
        return;
      }

      setIsAdding(true);

      const response = await fetch("/api/team/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newMemberName, email: newMemberEmail }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error message from API response
        toast.error(data.error || "Failed to add member");
        return;
      }

      // setTeam([...team, data.member]);
      setNewMemberName("");
      setNewMemberEmail("");
      setOpenDialog(false);
      toast.success("Member added successfully");
      fetchTeam();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-medium text-foreground">
            Team Members
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Invite your team members to collaborate on your workspace.
          </CardDescription>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-106.5 bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Member</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a new member to your team.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                />

                <Label className="text-muted-foreground text-xs">Email</Label>
                <Input
                  id="name"
                  placeholder="Enter email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  className="border-2 border-border bg-background text-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button disabled={isAdding} onClick={handleAddMember}>
                  {isAdding ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-muted-foreground text-sm text-center py-4">
              Loading team members...
            </div>
          ) : (
            <div className="space-y-4">
              {team.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-4">
                  No team members found
                </div>
              ) : (
                <div className="grid gap-4">
                  {team.map((member) => (
                    <div
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border"
                      key={member.id}
                    >
                      {/* Avatar at the start */}
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.image && (
                            <AvatarImage src={member.image} alt={member.name || "User"} />
                          )}
                          <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                            {member.name?.slice(0, 2).toUpperCase() || member.user_email?.slice(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-foreground text-sm font-medium">
                            {member.name || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {/* Email in the center */}
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">
                          {member.user_email || "Unknown"}
                        </p>
                      </div>

                      {/* Role on the right */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-sm capitalize border",
                            member.status === "active"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                          )}
                        >
                          {member.status}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground text-sm capitalize border border-border"
                        >
                          {member.role || "User"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
