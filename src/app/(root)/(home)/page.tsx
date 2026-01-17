"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import CandidateInterviewCard from "@/components/CandidateInterviewCard";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* WELCOME SECTION */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2">
          {isInterviewer
            ? "Manage your interviews and review candidates effectively"
            : "Access your upcoming interviews and preparations"}
        </p>
      </div>

      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Your Interviews</h1>
              <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
            </div>
            <button
              onClick={() => {
                setModalType("join");
                setShowModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Join with Meeting ID
            </button>
          </div>

          <div className="space-y-8">
            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <>
                {/* UPCOMING INTERVIEWS SECTION */}
                {(() => {
                  const now = new Date();
                  const upcomingInterviews = interviews.filter(
                    (interview) => 
                      interview.status === "upcoming" || 
                      new Date(interview.startTime) > now
                  );
                  
                  return upcomingInterviews.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
                        <Badge variant="outline">{upcomingInterviews.length}</Badge>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingInterviews.map((interview) => (
                          <CandidateInterviewCard 
                            key={interview._id} 
                            interview={interview} 
                            isCompleted={false}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })()}

                {/* COMPLETED INTERVIEWS SECTION */}
                {(() => {
                  const completedInterviews = interviews.filter(
                    (interview) => 
                      interview.status === "completed" || 
                      interview.status === "succeeded" || 
                      interview.status === "failed"
                  );
                  
                  return completedInterviews.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-semibold">Completed Interviews</h2>
                        <Badge variant="secondary">{completedInterviews.length}</Badge>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {completedInterviews.map((interview) => (
                          <CandidateInterviewCard 
                            key={interview._id} 
                            interview={interview} 
                            isCompleted={true}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                You have no scheduled interviews at the moment
              </div>
            )}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Join Meeting"
            isJoinMeeting={true}
          />
        </>
      )}
    </div>
  );
}
