"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";
import { getCandidateInfo, groupInterviews } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import CommentDialog from "@/components/CommentDialog";
import InterviewDetailsDialog from "@/components/InterviewDetailsDialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type Interview = Doc<"interviews">;

function DashboardPage() {
  const users = useQuery(api.users.getUsers);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateRating = useMutation(api.interviews.updateInterviewRating);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleRatingUpdate = async (
    interviewId: Id<"interviews">,
    rating: "pass" | "fail"
  ) => {
    try {
      await updateRating({
        id: interviewId,
        rating,
        interviewerNotes: notes[interviewId] || undefined,
      });
      toast.success(`Candidate marked as ${rating.toUpperCase()}`);
      setNotes((prev) => ({ ...prev, [interviewId]: "" }));
    } catch (error) {
      toast.error("Failed to update rating");
    }
  };

  if (!interviews || !users) return <LoaderUI />;

  const groupedInterviews = groupInterviews(interviews);

  // Combine all completed categories
  const upcomingInterviews = groupedInterviews.upcoming || [];
  const completedInterviews = [
    ...(groupedInterviews.completed || []),
    ...(groupedInterviews.succeeded || []),
    ...(groupedInterviews.failed || []),
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/schedule">
          <Button>Schedule New Interview</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* UPCOMING INTERVIEWS SECTION */}
        {upcomingInterviews.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
              <Badge variant="outline">{upcomingInterviews.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingInterviews.map((interview: Interview) => {
                const candidateInfo = getCandidateInfo(users, interview.candidateId);
                const startTime = new Date(interview.startTime);

                return (
                  <Card key={interview._id} className="hover:shadow-md transition-all">
                    {/* CANDIDATE INFO */}
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={candidateInfo.image} />
                          <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{candidateInfo.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{interview.title}</p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* DATE & TIME */}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(startTime, "MMM dd")}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {format(startTime, "hh:mm a")}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Badge variant="default" className="w-full justify-center py-2">
                        Scheduled
                      </Badge>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* COMPLETED INTERVIEWS SECTION */}
        {completedInterviews.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Completed Interviews</h2>
              <Badge variant="secondary">{completedInterviews.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedInterviews.map((interview: Interview) => {
                const candidateInfo = getCandidateInfo(users, interview.candidateId);
                const startTime = new Date(interview.startTime);

                return (
                  <Card key={interview._id} className="hover:shadow-md transition-all">
                    {/* CANDIDATE INFO */}
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={candidateInfo.image} />
                          <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">{candidateInfo.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{interview.title}</p>
                        </div>
                        {interview.rating && (
                          <Badge
                            variant={interview.rating === "pass" ? "default" : "destructive"}
                            className="ml-auto"
                          >
                            {interview.rating === "pass" ? "PASS" : "FAIL"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    {/* DATE & TIME */}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(startTime, "MMM dd")}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {format(startTime, "hh:mm a")}
                        </div>
                      </div>
                    </CardContent>

                    {/* ACTIONS */}
                    <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                      {/* View Details Button */}
                      <InterviewDetailsDialog interviewId={interview._id} />
                      
                      {/* Rating Section - Only show if not rated yet */}
                      {!interview.rating && (
                        <>
                          <Textarea
                            placeholder="Add notes (optional)..."
                            value={notes[interview._id] || ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [interview._id]: e.target.value }))
                            }
                            className="text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2 w-full">
                            <Button
                              className="flex-1"
                              onClick={() => handleRatingUpdate(interview._id, "pass")}
                            >
                              <CheckCircle2Icon className="h-4 w-4 mr-2" />
                              Pass
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleRatingUpdate(interview._id, "fail")}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Fail
                            </Button>
                          </div>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
export default DashboardPage;
