"use client";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode }: any) {
  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
