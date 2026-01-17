"use client";

import LoaderUI from "@/components/LoaderUI";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import useGetCallById from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

function MeetingPage() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: id as string,
  });
  const createInterview = useMutation(api.interviews.createInterview);
  const updateCandidate = useMutation(api.interviews.updateInterviewCandidate);

  // Auto-create interview record if it doesn't exist
  useEffect(() => {
    const createInterviewIfNeeded = async () => {
      if (!call || !user || interview === undefined) return;
      
      // Get title and description from call metadata
      const callData = call.state.custom;
      const title = callData?.title || "Interview Session";
      const description = callData?.description || "";
      
      // Determine who is candidate and who is interviewer
      const isCreator = call.state.createdBy?.id === user.id;
      const interviewerId = call.state.createdBy?.id || user.id;
      
      // If interview doesn't exist, create it
      if (interview === null) {
        console.log("Creating interview record for meeting:", id);
        
        try {
          await createInterview({
            title: title as string,
            description: description as string,
            startTime: Date.now(),
            status: "upcoming",
            streamCallId: id as string,
            candidateId: isCreator ? "" : user.id, // Set candidate if non-creator
            interviewerIds: [interviewerId],
          });
          console.log("Interview record created successfully");
        } catch (error) {
          console.error("Failed to create interview record:", error);
        }
      } 
      // If interview exists but has no candidate and user is not creator, update candidate
      else if (interview && !isCreator && (!interview.candidateId || interview.candidateId === "")) {
        console.log("Updating interview candidate to:", user.id);
        try {
          await updateCandidate({
            streamCallId: id as string,
            candidateId: user.id,
          });
          console.log("Candidate updated successfully");
        } catch (error) {
          console.error("Failed to update candidate:", error);
        }
      }
    };

    createInterviewIfNeeded();
  }, [call, user, interview, id, createInterview, updateCandidate]);

  if (!isLoaded || isCallLoading) return <LoaderUI />;

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl font-semibold">Meeting not found</p>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        {!isSetupComplete ? (
          <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
        ) : (
          <MeetingRoom />
        )}
      </StreamTheme>
    </StreamCall>
  );
}
export default MeetingPage;
