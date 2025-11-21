
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

type Language = "python" | "csharp" | "cpp" | "javascript";

interface Challenge {
  id: number;
  title: string;
  question: string;
  type: "Code" | "Text";
}

export default function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("python");
  const [running, setRunning] = useState(false);

  const [code, setCode] = useState<string>("");
  const [submitOutput, setSubmitOutput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetch(`http://localhost:5180/api/challenges/${id}`)
      .then((res) => res.json())
      .then(setChallenge);
  }, [id]);

  const handleEditorChange = (value: string | undefined) => setCode(value ?? "");

    const handleRun = async () => {
    setRunning(true);
    setOutput("");

    try {
      const res = await fetch("http://localhost:5180/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, answer }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setOutput(data.output);
    } catch (err: unknown) {
      if (err instanceof Error) setOutput(`Error: ${err.message}`);
      else setOutput("Unexpected error");
    } finally {
      setRunning(false);
    }
  };


    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const res = await fetch(`http://localhost:5180/api/challenges/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // TODO: replace with actual user
          challengeId: Number(id),
          answer,
          language
        }),
      });
      const data = await res.json();

      console.log(data)
      if (res.ok) {
        setResult(data.message || "Correct!");

      } else {
        setResult("Incorrect answer. Try again!");

      }
  }

  if (!challenge) return <p>Loading...</p>;

 return (
    <div className="p-6 text-white max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      <p className="text-gray-300 mb-6">{challenge.question}</p>
    
      {challenge.type == "Code" ? (
        <div className="mb-3">
          <label>Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="bg-grey-800 rounded">
            <option className="text-gray-600" value="csharp">C#</option>
            <option className="text-gray-600" value="javascript">JavaScript</option>
            <option className="text-gray-600" value="cpp">C++</option>
            <option className="text-gray-600" value="python">Python</option>
          </select>
          <Editor height="90vh" language={language === "csharp" ? "csharp": language === "cpp"? "cpp": language} defaultValue="// comment" value={code} onChange={handleEditorChange} />
          <button disabled={running} onClick={handleRun} className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold">{running ? "Running..." : "Run"}</button>
          <button onClick={handleSubmit} className=" mt-4 bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold">Submit</button>
        </div>
      ) : 
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
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold"
            >
              Submit Answer
            </button>
          </form>
      }
   
      {result && <p className={`mt-4 text-lg ${result.toLowerCase().includes("incorrect") ? "text-red-400" : "text-green-400"}`}>{result}</p>}
    </div>
  );
}