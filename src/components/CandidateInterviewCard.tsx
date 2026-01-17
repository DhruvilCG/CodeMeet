"use client";

import { Doc } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CODING_QUESTIONS } from "@/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

type Interview = Doc<"interviews">;

interface CandidateInterviewCardProps {
  interview: Interview;
  isCompleted?: boolean;
}

export default function CandidateInterviewCard({ interview, isCompleted = false }: CandidateInterviewCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const details = useQuery(
    api.interviews.getInterviewDetails, 
    isCompleted ? { interviewId: interview._id } : "skip"
  );

  const startTime = new Date(interview.startTime);

  const assignedQuestion =
    details?.questionAssignment
      ? CODING_QUESTIONS.find((q) => q.id === details.questionAssignment?.questionId)
      : null;

  return (
    <>
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{interview.title}</CardTitle>
            {interview.rating && isCompleted && (
              <Badge
                variant={interview.rating === "pass" ? "default" : "destructive"}
              >
                {interview.rating === "pass" ? "PASS" : "FAIL"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {format(startTime, "MMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {format(startTime, "hh:mm a")}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          ) : (
            <Badge variant="default" className="w-full justify-center py-2">
              Scheduled
            </Badge>
          )}
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Interview Results</DialogTitle>
            <DialogDescription>
              Your performance summary for {interview.title}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Result:</span>
                    {interview.rating ? (
                      <Badge
                        variant={interview.rating === "pass" ? "default" : "destructive"}
                        className="text-sm"
                      >
                        {interview.rating === "pass" ? "✓ PASSED" : "✗ FAILED"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending Review</Badge>
                    )}
                  </div>
                  {interview.interviewerNotes && (
                    <div className="mt-4">
                      <span className="text-sm font-medium">Interviewer Feedback:</span>
                      <p className="mt-2 text-sm bg-muted p-3 rounded-md">
                        {interview.interviewerNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question Section */}
              {assignedQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question Attempted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{assignedQuestion.title}</h3>
                    <Badge className="mb-3">{assignedQuestion.difficulty}</Badge>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assignedQuestion.description}
                    </p>

                    {/* Examples */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Examples:</p>
                      {assignedQuestion.examples.map((example, idx) => (
                        <div key={idx} className="bg-muted p-3 rounded-md text-sm space-y-1">
                          <p>
                            <span className="font-medium">Input:</span> {example.input}
                          </p>
                          <p>
                            <span className="font-medium">Output:</span> {example.output}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Your Submissions */}
              {details?.submissions && details.submissions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Your Submissions ({details.submissions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {details.submissions.map((submission, index) => (
                      <div key={submission._id} className="space-y-3 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{submission.language}</Badge>
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
                                className={`text-sm p-2 rounded-md ${
                                  result.passed
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                                }`}
                              >
                                <span className="font-medium">{result.testName}:</span>{" "}
                                {result.passed ? "✓ Passed" : "✗ Failed"}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Code Preview */}
                        <div>
                          <p className="text-sm font-medium mb-2">Your Code:</p>
                          <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto border">
                            <code>{submission.code}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No submissions recorded for this interview
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
