"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

interface TestCase {
  Input: string;
  Expected: string;
}

interface Challenge {
  challengeId: number;
  title: string;
  question: string;
  xpGained: number;
  type: string;
  category: string;
  difficulty: string;
  correctAnswer: string | null;
  testCasesJson: string | null;
  hintPenalty: number;
  hintsJson: string | null;
}

interface RunResult {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
}

type Language = "python" | "csharp" | "javascript" | "cpp";

export default function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState<Language>("python");

  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const [hints, setHints] = useState<string[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenge() {
      const res = await fetch(`http://localhost:5180/api/challenges/${id}`);
      const data = await res.json();

      setChallenge(data);

      if (data.testCasesJson) {
        try {
          const parsed = JSON.parse(data.testCasesJson);
          setTestCases(parsed);

        } catch (err: unknown) {
          if (err instanceof Error) console.error(`Error: ${err.message}`);
          else console.error("Unexpected error occurred.");
        }
      }
    }

    fetchChallenge();
  }, [id]);


  function handleEditorChange(value: string | undefined) {
    setAnswer(value ?? "");
  }

  async function handleRunTests() {
    if (!testCases.length) return;

    setRunning(true);
    setRunResults([]);

    const results: RunResult[] = [];

    for (const tc of testCases) {
      const res = await fetch("http://localhost:5180/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          answer,
          stdin: tc.Input
        })
      });

      const data = await res.json();

      const output = (data.output ?? "").trim();
      const expected = tc.Expected.trim();

      results.push({
        input: tc.Input,
        expected,
        output,
        passed: output === expected
      });
    }

    setRunResults(results);
    setRunning(false);
  }


  async function handleSubmit() {
    setSubmitMessage(null);

    const res = await fetch(`http://localhost:5180/api/challenges/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1, // TODO replace with actual user
        challengeId: Number(id),
        answer,
        language
      })
    });

    const data = await res.json();
    setSubmitMessage(data.message);
  }

  async function handleShowHint() {
    const res = await fetch(`http://localhost:5180/api/challenges/${id}/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(1) // userId = 1 
    });

    const data = await res.json();
    if (data.hint) {
      setHints(prev => [...prev, data.hint]);
    }
    setHintMessage(data.message);
  }

  if (!challenge) return <p className="text-white">Loading...</p>;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      <p className="text-gray-300 mb-6 whitespace-pre-line">{challenge.question}</p>
      <button
        onClick={handleShowHint}
        className="mt-4 bg-yellow-600 px-4 py-2 rounded font-semibold"
      >
        Show Hint (-{challenge.hintPenalty} XP)
      </button>
      {challenge.type === "Text" && (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Your answer"
          />

          <button
            onClick={handleSubmit}
            className="mt-4 bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold"
          >
            Submit Answer
          </button>

          {submitMessage && (
            <p className="mt-3 text-lg">{submitMessage}</p>
          )}
        </div>
      )}

      {challenge.type === "Code" && (
        <div>
          <label>Language: </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-800 p-2 rounded ml-2 mb-4"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
          </select>

          <Editor
            height="400px"
            language={language}
            value={answer}
            defaultValue=""
            onChange={handleEditorChange}
            theme="vs-dark"
          />

          <button
            disabled={running}
            onClick={handleRunTests}
            className="mt-4 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded font-semibold mr-3"
          >
            {running ? "Running..." : "Run Tests"}
          </button>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-semibold"
          >
            Submit
          </button>
          {hints.length > 0 && (
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <h3 className="text-lg font-bold">Hints</h3>
              {hints.map((h, i) => (
                <p key={i} className="mt-2 text-yellow-300">{h}</p>
              ))}
            </div>
          )}

          {hintMessage && <p className="mt-3">{hintMessage}</p>}

          {runResults.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Test results</h2>

              {runResults.map((r, index) => (
                <div
                  key={index}
                  className={`p-3 mb-2 rounded ${r.passed ? "bg-green-800" : "bg-red-800"
                    }`}
                >
                  <p><strong>Input:</strong> {r.input}</p>
                  <p><strong>Expected:</strong> {r.expected}</p>
                  <p><strong>Output:</strong> {r.output}</p>
                  <p><strong>Status:</strong> {r.passed ? "PASSED" : "FAILED"}</p>
                </div>
              ))}
            </div>
          )}

          {submitMessage && (
            <p className="mt-4 text-lg">{submitMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}