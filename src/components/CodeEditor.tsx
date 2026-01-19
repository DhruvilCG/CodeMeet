import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircleIcon, BookIcon, LightbulbIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

function CodeEditor() {
  const { id } = useParams();
  const { isCandidate, isInterviewer } = useUserRole();
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java">(LANGUAGES[0].id);
  const [code, setCode] = useState(selectedQuestion.starterCode[language]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const assignment = useQuery(api.interviews.getAssignedQuestion, { 
    streamCallId: id && typeof id === "string" ? id : "" 
  });
  const submissions = useQuery(api.interviews.getSubmissions, {
    streamCallId: id && typeof id === "string" ? id : ""
  });
  const submitSolutionMutation = useMutation(api.interviews.submitSolution);
  const assignQuestionMutation = useMutation(api.interviews.assignQuestion);

  const assignedQuestion = assignment?.questionId
    ? CODING_QUESTIONS.find((q) => q.id === assignment.questionId)
    : null;

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    if (isCandidate) {
      setCode(question.starterCode[language]);
    }
  };

  const handleLanguageChange = (newLanguage: "javascript" | "python" | "java") => {
    setLanguage(newLanguage);
    const currentQuestion = isCandidate && assignedQuestion ? assignedQuestion : selectedQuestion;
    setCode(currentQuestion.starterCode[newLanguage]);
  };

  const runTests = async () => {
    if (!assignedQuestion) return;

    // Validate code is not empty or just starter code
    const trimmedCode = code.trim();
    const starterCode = assignedQuestion.starterCode[language].trim();
    
    if (!trimmedCode || trimmedCode === starterCode) {
      toast.error("Please write your solution before testing");
      return;
    }

    setIsSubmitting(true);
    setShowResults(false);
    
    try {
      const results = [];

      for (let i = 0; i < assignedQuestion.examples.length; i++) {
        const example = assignedQuestion.examples[i];
        
        try {
          // Prepare code with test case
          let fullCode = code;
          
          if (language === "javascript") {
            // Add test execution code
            fullCode += `\n\n// Test case\nconst result = twoSum(${example.input});\nconsole.log(JSON.stringify(result));`;
          } else if (language === "python") {
            fullCode += `\n\n# Test case\nresult = twoSum(${example.input})\nprint(result)`;
          }

          // Execute code via Piston API
          const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language: language === "javascript" ? "javascript" : language,
              version: "*",
              files: [{
                content: fullCode,
              }],
            }),
          });

          const data = await response.json();
          
          if (data.run && data.run.output) {
            const output = data.run.output.trim();
            const expectedOutput = example.output.trim();
            
            // Normalize output for comparison
            const normalizedOutput = output.replace(/\s+/g, '');
            const normalizedExpected = expectedOutput.replace(/\s+/g, '');
            
            const passed = normalizedOutput === normalizedExpected;
            
            results.push({
              testName: `Example ${i + 1}`,
              passed: passed,
              expected: expectedOutput,
              actual: output,
            });
          } else if (data.run && data.run.stderr) {
            results.push({
              testName: `Example ${i + 1}`,
              passed: false,
              expected: example.output,
              actual: `Error: ${data.run.stderr}`,
            });
          } else {
            results.push({
              testName: `Example ${i + 1}`,
              passed: false,
              expected: example.output,
              actual: "Execution failed",
            });
          }
        } catch (error) {
          results.push({
            testName: `Example ${i + 1}`,
            passed: false,
            expected: example.output,
            actual: `Error: ${error}`,
          });
        }
      }

      setTestResults(results);
      setShowResults(true);

      // Show test results without auto-submitting
      const allPassed = results.every(r => r.passed);
      const anyPassed = results.some(r => r.passed);
      
      if (allPassed) {
        toast.success("✅ All tests passed!");
      } else if (anyPassed) {
        toast("⚠️ Some tests passed, but not all.");
      } else {
        toast.error("❌ All tests failed. Please fix your solution.");
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Failed to execute tests. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignedQuestion) return;
    
    // Validate code is not empty
    const trimmedCode = code.trim();
    const starterCode = assignedQuestion.starterCode[language].trim();
    
    if (!trimmedCode || trimmedCode === starterCode) {
      toast.error("Please write your solution before submitting");
      return;
    }

    // Check if tests have been run
    if (testResults.length === 0) {
      toast("⚠️ Please run tests before submitting");
      return;
    }

    // Check if all tests passed
    const allPassed = testResults.every(r => r.passed);
    if (!allPassed) {
      toast.error("❌ All tests must pass before submitting");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting solution:", {
        streamCallId: id,
        questionId: assignedQuestion.id,
        codeLength: code.length,
        language,
        testResultsCount: testResults.length,
      });

      const result = await submitSolutionMutation({
        streamCallId: id as string,
        questionId: assignedQuestion.id,
        code,
        language,
        testResults,
      });

      console.log("Submission result:", result);
      toast.success("✅ Solution submitted successfully!");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignQuestion = async () => {
    if (!id) {
      toast.error("Meeting ID not found");
      return;
    }

    try {
      await assignQuestionMutation({
        streamCallId: id as string,
        questionId: selectedQuestion.id,
      });
      toast.success(`Assigned "${selectedQuestion.title}" to candidate`);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign question");
    }
  };

  // Interviewer view - just questions panel
  if (isInterviewer) {
    return (
      <div className="h-full bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* HEADER */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Interview Questions</h2>
                  <Badge variant="secondary">Interviewer Panel</Badge>
                </div>
                <p className="text-muted-foreground">
                  Select a question to assign to the candidate
                </p>
              </div>

              {/* QUESTION SELECTOR */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedQuestion.id} onValueChange={handleQuestionChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleAssignQuestion} 
                    className="w-full"
                    size="lg"
                  >
                    Assign This Question to Candidate
                  </Button>
                  
                  {assignedQuestion && (
                    <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Currently Assigned: {assignedQuestion.title}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CURRENT QUESTION DETAILS */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="h-5 w-5 text-primary/80" />
                  <CardTitle>Current Question: {selectedQuestion.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedQuestion.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Examples</h4>
                    <div className="space-y-2">
                      {selectedQuestion.examples.map((example, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm">
                          <p className="font-medium">Example {index + 1}:</p>
                          <p className="text-muted-foreground">Input: {example.input}</p>
                          <p className="text-muted-foreground">Output: {example.output}</p>
                          {example.explanation && (
                            <p className="text-muted-foreground mt-1">
                              Explanation: {example.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedQuestion.constraints && (
                    <div>
                      <h4 className="font-semibold mb-2">Constraints</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {selectedQuestion.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SUBMISSIONS SECTION */}
              {submissions && submissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Submissions ({submissions.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submissions.slice().reverse().map((submission, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">Submission {submissions.length - index}</p>
                          <Badge variant={submission.status === "passed" ? "default" : "secondary"}>
                            {submission.status || "pending"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">
                            Language: <span className="font-mono font-semibold">{submission.language}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Code Preview */}
                        <div className="mt-3">
                          <p className="text-sm font-semibold mb-2">Candidate's Code:</p>
                          <ScrollArea className="h-[200px] w-full rounded border bg-black/5 dark:bg-black/20">
                            <pre className="p-3 text-xs font-mono">
                              {submission.code}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                        
                        {submission.testResults && submission.testResults.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-semibold">Test Results:</p>
                            {submission.testResults.map((result: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                {result.passed ? (
                                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircleIcon className="h-4 w-4 text-red-500" />
                                )}
                                <span>{result.testName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    );
  }

  // Candidate view - full coding environment
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc-100vh-4rem-1px]">
      {/* QUESTION SECTION */}
      <ResizablePanel defaultSize={35} minSize={25}>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {!assignedQuestion ? (
                <div className="text-center py-12">
                  <p className="text-xl font-semibold mb-2">Waiting for Question Assignment</p>
                  <p className="text-muted-foreground">
                    The interviewer will assign you a question shortly
                  </p>
                </div>
              ) : (
                <>
                  {/* HEADER */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {assignedQuestion.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose your language and solve the problem
                    </p>
                  </div>

                  {/* PROBLEM DESC. */}
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <BookIcon className="h-5 w-5 text-primary/80" />
                      <CardTitle>Problem Description</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-relaxed">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line">{assignedQuestion.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PROBLEM EXAMPLES */}
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                      <CardTitle>Examples</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-full w-full rounded-md border">
                        <div className="p-4 space-y-4">
                          {assignedQuestion.examples.map((example, index) => (
                            <div key={index} className="space-y-2">
                              <p className="font-medium text-sm">Example {index + 1}:</p>
                              <ScrollArea className="h-full w-full rounded-md">
                                <pre className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                                  <div>Input: {example.input}</div>
                                  <div>Output: {example.output}</div>
                                  {example.explanation && (
                                    <div className="pt-2 text-muted-foreground">
                                      Explanation: {example.explanation}
                                    </div>
                                  )}
                                </pre>
                                <ScrollBar orientation="horizontal" />
                              </ScrollArea>
                            </div>
                          ))}
                        </div>
                        <ScrollBar />
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* CONSTRAINTS */}
                  {assignedQuestion.constraints && (
                    <Card>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                        <CardTitle>Constraints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                          {assignedQuestion.constraints.map((constraint, index) => (
                            <li key={index} className="text-muted-foreground">
                              {constraint}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </ResizablePanel>

      {assignedQuestion && (
        <>
          <ResizableHandle withHandle />

          {/* CODE EDITOR + CONTROLS */}
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full flex flex-col">
              {/* Language Selector */}
              <div className="p-4 border-b bg-background flex items-center justify-between">
                <h3 className="font-semibold">Code Editor</h3>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={`/${language}.png`}
                          alt={language}
                          className="w-5 h-5 object-contain"
                        />
                        {LANGUAGES.find((l) => l.id === language)?.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/${lang.id}.png`}
                            alt={lang.name}
                            className="w-5 h-5 object-contain"
                          />
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Editor */}
              <div className="flex-1 relative">
                <Editor
                  height={"100%"}
                  defaultLanguage={language}
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 18,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    wordWrap: "on",
                    wrappingIndent: "indent",
                  }}
                />
              </div>

              {/* Test Results */}
              {showResults && testResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-t bg-muted/30">
                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      Test Results
                      <Badge variant={testResults.every(r => r.passed) ? "default" : "destructive"}>
                        {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm p-2 rounded bg-background">
                          {result.passed ? (
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{result.testName}</p>
                            {!result.passed && (
                              <div className="text-xs mt-1 space-y-1 text-muted-foreground">
                                <p>Expected: {result.expected}</p>
                                <p>Got: {result.actual}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 border-t bg-background flex gap-2">
                <Button
                  onClick={runTests}
                  disabled={isSubmitting}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? "Testing..." : "Run Tests"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || testResults.length === 0 || !testResults.every(r => r.passed)}
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
export default CodeEditor;
