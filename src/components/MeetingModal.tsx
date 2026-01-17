import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import useMeetingActions from "@/hooks/useMeetingActions";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isJoinMeeting: boolean;
}

function MeetingModal({ isOpen, onClose, title, isJoinMeeting }: MeetingModalProps) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const { createInstantMeeting, joinMeeting } = useMeetingActions();

  const handleStart = () => {
    if (isJoinMeeting) {
      // if it's a full URL extract meeting ID
      const meetingId = meetingUrl.split("/").pop();
      if (meetingId) joinMeeting(meetingId);
    } else {
      // Pass title and description when creating meeting
      createInstantMeeting(meetingTitle, meetingDescription);
    }

    setMeetingUrl("");
    setMeetingTitle("");
    setMeetingDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isJoinMeeting ? (
            <Input
              placeholder="Paste meeting link here..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
            />
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Interview Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Frontend Developer Interview"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add interview details..."
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleStart} 
              disabled={isJoinMeeting ? !meetingUrl.trim() : !meetingTitle.trim()}
            >
              {isJoinMeeting ? "Join Meeting" : "Start Interview"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default MeetingModal;
