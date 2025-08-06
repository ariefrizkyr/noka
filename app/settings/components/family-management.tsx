"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  UserPlus, 
  Shield, 
  User, 
  Mail, 
  Clock, 
  X, 
  RefreshCw,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_role: 'admin' | 'member';
  joined_at: string;
}

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

interface FamilyInvitation {
  id: string;
  token: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  expires_at: string;
  created_at: string;
  invited_by: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export default function FamilyManagement() {
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  
  // Create family dialog state
  const [createFamilyOpen, setCreateFamilyOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Invite member dialog state
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);

  const fetchFamilies = useCallback(async () => {
    try {
      const response = await fetch("/api/families");
      if (!response.ok) throw new Error("Failed to fetch families");

      const data = await response.json();
      setFamilies(data.data);
      
      // Auto-select first family if available
      if (data.data.length > 0 && !selectedFamily) {
        setSelectedFamily(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching families:", error);
      toast.error("Failed to load families");
    } finally {
      setLoading(false);
    }
  }, [selectedFamily]);

  const fetchFamilyMembers = useCallback(async () => {
    if (!selectedFamily) return;
    
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/families/${selectedFamily.id}/members`);
      if (!response.ok) throw new Error("Failed to fetch family members");

      const data = await response.json();
      setFamilyMembers(data.data);
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error("Failed to load family members");
    } finally {
      setLoadingMembers(false);
    }
  }, [selectedFamily]);

  const fetchPendingInvitations = useCallback(async () => {
    if (!selectedFamily) return;
    
    // Only admins can fetch invitations
    if (selectedFamily.user_role !== 'admin') {
      setPendingInvitations([]);
      setLoadingInvitations(false);
      return;
    }
    
    setLoadingInvitations(true);
    try {
      const response = await fetch(`/api/families/${selectedFamily.id}/invitations`);
      if (!response.ok) throw new Error("Failed to fetch pending invitations");

      const data = await response.json();
      setPendingInvitations(data.data);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      // Don't show error toast for this as it's not critical
      setPendingInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }, [selectedFamily]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  useEffect(() => {
    if (selectedFamily) {
      fetchFamilyMembers();
      fetchPendingInvitations();
    }
  }, [selectedFamily, fetchFamilyMembers, fetchPendingInvitations]);

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) {
      toast.error("Please enter a family name");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFamilyName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create family");

      const data = await response.json();
      const newFamily = data.data;
      
      setFamilies(prev => [...prev, newFamily]);
      setSelectedFamily(newFamily);
      setNewFamilyName("");
      setCreateFamilyOpen(false);
      toast.success("Family created successfully");
    } catch (error) {
      console.error("Error creating family:", error);
      toast.error("Failed to create family");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedFamily || !inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`/api/families/${selectedFamily.id}/members/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }

      setInviteEmail("");
      setInviteRole('member');
      setInviteMemberOpen(false);
      toast.success("Invitation sent successfully");
      
      // Refresh pending invitations
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/by-id/${invitationId}/cancel`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel invitation");
      }

      toast.success("Invitation cancelled successfully");
      
      // Refresh pending invitations
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/by-id/${invitationId}/resend`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend invitation");
      }

      toast.success("Invitation resent successfully");
      
      // Refresh pending invitations
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // No families state
  if (families.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No families yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first family to start collaborating on finances.
          </p>
          
          <Dialog open={createFamilyOpen} onOpenChange={setCreateFamilyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Family</DialogTitle>
                <DialogDescription>
                  Choose a name for your family. You can add members after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    placeholder="e.g., Smith Family"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFamily()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateFamilyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFamily} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Family"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const isCurrentUserAdmin = selectedFamily?.user_role === 'admin';

  return (
    <div className="space-y-6">
      {/* Family Selection */}
      <div className="space-y-2">
        <Label>Select Family</Label>
        <div className="flex gap-2">
          <Select
            value={selectedFamily?.id || ""}
            onValueChange={(value) => {
              const family = families.find(f => f.id === value);
              setSelectedFamily(family || null);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  <div className="flex items-center gap-2">
                    <span>{family.name}</span>
                    {family.user_role === 'admin' && (
                      <Shield className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={createFamilyOpen} onOpenChange={setCreateFamilyOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Family</DialogTitle>
                <DialogDescription>
                  Choose a name for your family. You can add members after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    placeholder="e.g., Smith Family"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFamily()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateFamilyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFamily} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Family"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedFamily && (
        <>
          <Separator />

          {/* Family Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{selectedFamily.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {selectedFamily.user_role === 'admin' ? (
                  <Shield className="h-4 w-4 text-blue-600" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>Your role: {selectedFamily.user_role}</span>
              </div>
              <div>
                Joined {formatDistanceToNow(new Date(selectedFamily.joined_at))} ago
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Family Members</h4>
              {isCurrentUserAdmin && (
                <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Family Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your family. They'll receive an email with instructions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="member@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          {inviteRole === 'admin' 
                            ? "Admins can manage members and family settings"
                            : "Members can view and manage family finances"
                          }
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setInviteMemberOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteMember} disabled={inviting}>
                          {inviting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Invitation"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {member.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                      <div>
                        <div className="font-medium">User {member.user_id.slice(0, 8)}...</div>
                        <div className="text-sm text-gray-500">
                          {member.role} • Joined {formatDistanceToNow(new Date(member.joined_at))} ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {isCurrentUserAdmin && (
            <div className="space-y-4">
              <h4 className="font-medium">Pending Invitations</h4>
              
              {loadingInvitations ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : pendingInvitations.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No pending invitations</p>
              ) : (
                <div className="space-y-2">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-gray-500">
                            {invitation.role} • Sent {formatDistanceToNow(new Date(invitation.created_at))} ago
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-600">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation.id)}
                          title="Resend invitation"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" title="Cancel invitation">
                              <X className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the invitation sent to {invitation.email}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelInvitation(invitation.id)}>
                                Cancel Invitation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}