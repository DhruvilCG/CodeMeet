"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { CODING_QUESTIONS } from "@/constants";

interface InterviewDetailsDialogProps {
  interviewId: Id<"interviews">;
}

export default function InterviewDetailsDialog({ interviewId }: InterviewDetailsDialogProps) {
  const details = useQuery(api.interviews.getInterviewDetails, { interviewId });

  if (!details) return null;

  const { interview, submissions, questionAssignment } = details;
  const assignedQuestion = questionAssignment
    ? CODING_QUESTIONS.find((q) => q.id === questionAssignment.questionId)
    : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
          <DialogDescription>
            Review the candidate's performance and submitted solutions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Interview Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{interview.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge>{interview.status}</Badge>
                </div>
                {interview.rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <Badge variant={interview.rating === "pass" ? "default" : "destructive"}>
                      {interview.rating.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {interview.interviewerNotes && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-2 text-sm bg-muted p-3 rounded-md">
                      {interview.interviewerNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Question */}
            {assignedQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{assignedQuestion.title}</h3>
                  <Badge className="mb-4">{assignedQuestion.difficulty}</Badge>
                  <p className="text-sm text-muted-foreground">{assignedQuestion.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Submissions */}
            {submissions && submissions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Submitted Solutions ({submissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {submissions.map((submission, index) => (
                    <div key={submission._id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          Submission {index + 1}
                          <Badge variant="outline" className="ml-2">
                            {submission.language}
                          </Badge>
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Test Results */}
                      {submission.testResults && submission.testResults.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Test Results:</p>
                          {submission.testResults.map((result, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted"
                            >
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">{result.testName}:</span>
                              <span className={result.passed ? "text-green-600" : "text-red-600"}>
                                {result.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Code */}
                      <div>
                        <p className="text-sm font-medium mb-2">Code:</p>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                          <code>{submission.code}</code>
                        </pre>
                      </div>

                      {index < submissions.length - 1 && <hr className="my-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No submissions found for this interview
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
