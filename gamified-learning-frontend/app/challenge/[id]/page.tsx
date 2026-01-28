"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import CodeHistoryModal from "@/components/codeHistoryModal";
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

type HistoryTag = "AutoSave" | "RunTests" | "Submit";

interface CodeHistoryEntry {
  id: string;
  code: string;
  timestamp: string;
  tag: HistoryTag;
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
  const [history, setHistory] = useState<CodeHistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const langParam = searchParams.get("category")?.toLowerCase() as Language | null;
  const isLanguageLocked = !!langParam;

  const restoreCodeSkeleton = async (language: Language) => {
    if (!id) return;
    const res = await fetch(`http://localhost:5180/api/challenges/${id}/skel/${language}`);
    const codeSkel = await res.text();
    setAnswer(codeSkel);
  };

  const saveHistory = useCallback((code: string, tag: HistoryTag) => {
    if (!id || !code) return;
    const historyKey = `challenge:${id}:language:${language}:history`;
    const existing: CodeHistoryEntry[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (existing.length > 0 && existing[existing.length - 1].code === code) {
      return;
    }
    const newEntry: CodeHistoryEntry = {
      id: crypto.randomUUID(),
      code,
      timestamp: new Date().toISOString(),
      tag
    };
    const updated = [...existing, newEntry].slice(-20); // keep only last 20 entries
    localStorage.setItem(historyKey, JSON.stringify(updated));
    setHistory(updated);
  } , [id, language]);

  useEffect(() => {
    if (!id) return;
    const historyKey = `challenge:${id}:language:${language}:history`;
    const existing: CodeHistoryEntry[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
    setHistory(existing);
  }, [id, language]);

  function getEditorStorage(
    challengeId: string | number,
    language: string
  ) {
    return `challenge:${challengeId}:language:${language}:code`
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveHistory(answer, "AutoSave");
    }, 2000); // autosave every 2 seconds after user stops typing

    return () => clearTimeout(timeout);
  }, [answer]);

  useEffect(() => {
    if (langParam) {
      setLanguage(langParam);
    }
  }, [langParam])

  useEffect(() => {
    if (!id || !language) return;

    const key = getEditorStorage(id as string, language);
    const savedCode = localStorage.getItem(key)
    if (savedCode) {
      setAnswer(savedCode)
      return
    }
    fetch(`http://localhost:5180/api/challenges/${id}/skel/${language}`)
      .then(r => r.text())
      .then(code => setAnswer(code));
    // console.log("code skel: ", answer)
  }, [language, id])

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
    const code = value ?? "";
    setAnswer(code);
    if (!id) return
    const key = getEditorStorage(id as string, language)
    localStorage.setItem(key, code)
  }

  async function handleRunTests() {
    if (!testCases.length) return;
    saveHistory(answer, "RunTests");


    setRunning(true);
    setRunResults([]);

    const results: RunResult[] = [];


    if (!answer.trim()) {
      setRunResults([
        {
          input: "",
          expected: "",
          output: "No code provided",
          passed: false
        }
      ])
      setRunning(false)
      return
    }

    for (const tc of testCases) {
      const res = await fetch("http://localhost:5180/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ChallengeId: challenge?.challengeId,
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
    saveHistory(answer, "Submit");

    setSubmitMessage(null);

    if (!answer.trim()) {
      setSubmitMessage("No code provided")
      return
    }
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
    <>
      <CodeHistoryModal
        open={showHistoryModal}
        history={history}
        language={language}
        setAnswer={setAnswer}
        clearHistory={() => {
          if (!id) return;
          const historyKey = `challenge:${id}:language:${language}:history`;
          localStorage.removeItem(historyKey);
          setHistory([]);
        }}
        onClose={() => setShowHistoryModal(false)}
      />
      <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
        <button className="font-semibold cursor-pointer" onClick={() => router.push('/')}>
          Home
        </button>
      </div><div className="p-6 text-white max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
        <p className="text-gray-300 mb-6 whitespace-pre-line">{challenge.question}</p>
        <button
          onClick={handleShowHint}
          className="mt-4 bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer mb-4"
          data-testid="show-hint"
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
              placeholder="Your answer" />

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
            <div className="flex justify-between items-center mb-4">
              <div>
                <label>Language: </label>
                {isLanguageLocked ? (
                  <span data-testid="language-display" className="ml-2">{langParam.charAt(0).toUpperCase() + String(langParam).slice(1)}</span>
                ) : (
                  <select
                    value={language}
                    data-testid="language-select"
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-gray-800 hover:bg-gray-700 p-2 rounded cursor-pointer"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="csharp">C#</option>
                    <option value="cpp">C++</option>
                  </select>
                )}
              </div>
              <div className="flex flex-end">
              <button onClick={() => restoreCodeSkeleton(language)}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded font-semibold cursor-pointer"
                data-testid="restore-skeleton">
                Restore Code Skeleton
              </button>
              <button className="ml-4 bg-gray-700 hover:bg-gray-600 p-2 rounded font-semibold cursor-pointer "
                onClick={() => setShowHistoryModal(true)}>History</button>
              </div>
            </div>
            <Editor
              height="400px"
              language={language}
              value={answer}
              defaultValue=""
              onChange={handleEditorChange}
              theme="vs-dark" />

            <button
              disabled={running}
              onClick={handleRunTests}
              className="mt-4 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded font-semibold mr-3 cursor-pointer"
            >
              {running ? "Running..." : "Run Tests"}
            </button>

            <button
              onClick={handleSubmit}
              className="mt-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-semibold cursor-pointer"
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
                    className={`p-3 mb-2 rounded ${r.passed ? "bg-green-800" : "bg-red-800"}`}
                  >
                    <p><strong>Input:</strong> {r.input}</p>
                    <p><strong>Expected:</strong> {r.expected}</p>
                    <p><strong>Output:</strong> {r.output}</p>
                    <p data-testid="test-result"><strong>Status:</strong> {r.passed ? "PASSED" : "FAILED"}</p>
                  </div>
                ))}
              </div>
            )}

            {submitMessage && (
              <p className="mt-4 text-lg">{submitMessage}</p>
            )}
          </div>
        )}
      </div></>
  );
}