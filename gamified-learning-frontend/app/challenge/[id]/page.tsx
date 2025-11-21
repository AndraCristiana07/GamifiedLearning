"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  xp: number;
  question: string;
  type: "Code" | "Text";
  language?: "python" | "csharp" | "cpp" | "javascript";
  correctAnswer?: string;
}

type Language = "python" | "csharp" | "cpp" | "javascript";

export default function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [output, setOutput] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5180/api/challenges/${id}`)
      .then((res) => res.json())
      .then(setChallenge)
      .catch(() => setChallenge(null));
  }, [id]);

  const handleEditorChange = (value: string | undefined) => {
    setAnswer(value ?? "");
  };

  const handleRun = async () => {
    if (!answer.trim()) return;

    setRunning(true);
    setOutput("");

    try {
      const res = await fetch("http://localhost:5180/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, answer }),
      });

      if (!res.ok) throw new Error(`Execution failed: ${res.statusText}`);
      const data: { output: string } = await res.json();
      setOutput(data.output || "No output");
    } catch (err: unknown) {
      if (err instanceof Error) setOutput(`Error: ${err.message}`);
      else setOutput("Unexpected error occurred.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!answer.trim()) {
      setResult("Please enter an answer.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5180/api/challenges/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // TODO: replace with actual user ID
          challengeId: Number(id),
          answer,
          language: challenge?.type === "Code" ? language : undefined,
        }),
      });

      const data = await res.json();
      setResult(data.message ?? (res.ok ? "Correct!" : "Incorrect."));
    } catch (err) {
      if (err instanceof Error) setResult(`Submission failed: ${err.message}`);
      else setResult("Unexpected error during submission.");
    }
  };

  if (!challenge) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      <p className="text-gray-300 mb-6">{challenge.question}</p>

      {challenge.type === "Code" ? (
        <div className="mb-6">
          <label className="block mb-2">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-800 text-white px-3 py-1 rounded mb-4"
          >
            <option value="csharp">C#</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>

          <Editor
            height="400px"
            defaultLanguage={language}
            language={language}
            value={answer}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />

          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold"
            >
              {running ? "Running..." : "Run"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded font-semibold"
            >
              Submit
            </button>
          </div>

          {output && (
            <p className="mt-4 bg-gray-900 p-4 rounded text-sm whitespace-pre-wrap">
              {output}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded font-semibold"
          >
            Submit
          </button>
        </form>
      )}

      {result && <p className={`mt-4 text-lg ${result.toLowerCase().includes("incorrect") || result.toLowerCase().includes("failed")  ? "text-red-400" : "text-green-400"}`}>{result}</p>}
    </div>
  );
}