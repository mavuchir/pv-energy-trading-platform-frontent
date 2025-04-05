"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog"
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
} from "../ui/AlertDialog"
import { FaUserShield, FaUserCog, FaUserMinus, FaUser, FaSolarPanel, FaBatteryFull } from "react-icons/fa"

const CommunityMemberList = ({ members, currentUser, isAdmin, onUpdateRole, onRemoveMember }) => {
  const [selectedMember, setSelectedMember] = useState(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)

  const handleRoleChange = (role) => {
    if (selectedMember) {
      onUpdateRole(selectedMember.id, role)
      setShowRoleDialog(false)
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <FaUserShield className="mr-1" /> Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <FaUserCog className="mr-1" /> Moderator
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <FaUser className="mr-1" /> Member
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Community Members ({members.length})</h3>
        {isAdmin && (
          <Button size="sm" variant="outline">
            Manage Invitations
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                        {member.username ? member.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-medium">{member.username || member.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleBadge(member.role)}
                          {member.id === currentUser?.id && (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      {member.solar_capacity > 0 && (
                        <div className="flex items-center justify-end text-gray-600">
                          <FaSolarPanel className="mr-1" />
                          <span>{member.solar_capacity} kW</span>
                        </div>
                      )}
                      {member.battery_capacity > 0 && (
                        <div className="flex items-center justify-end text-gray-600">
                          <FaBatteryFull className="mr-1" />
                          <span>{member.battery_capacity} kWh</span>
                        </div>
                      )}
                    </div>
                    {isAdmin && member.id !== currentUser?.id && (
                      <div className="flex space-x-2">
                        <Dialog
                          open={showRoleDialog && selectedMember?.id === member.id}
                          onOpenChange={(open) => !open && setShowRoleDialog(false)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedMember(member)
                                setShowRoleDialog(true)
                              }}
                            >
                              <FaUserCog className="text-blue-600" />
                              <span className="sr-only">Change Role</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Member Role</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="mb-4">
                                Change role for <span className="font-bold">{member.username || member.email}</span>
                              </p>
                              <div className="space-y-2">
                                <Button
                                  variant={member.role === "admin" ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => handleRoleChange("admin")}
                                >
                                  <FaUserShield className="mr-2" /> Admin
                                </Button>
                                <Button
                                  variant={member.role === "moderator" ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => handleRoleChange("moderator")}
                                >
                                  <FaUserCog className="mr-2" /> Moderator
                                </Button>
                                <Button
                                  variant={member.role === "member" ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => handleRoleChange("member")}
                                >
                                  <FaUser className="mr-2" /> Member
                                </Button>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                                Cancel
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <FaUserMinus className="text-red-600" />
                              <span className="sr-only">Remove Member</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.username || member.email} from this community?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onRemoveMember(member.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityMemberList

