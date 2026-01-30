"use client";
import { motion, AnimatePresence } from "framer-motion";
import { DiffEditor } from "@monaco-editor/react";

export default function CodeDiffModal({
    open,
    oldCode,
    newCode,
    language,
    onClose
}: {
    open: boolean,
    oldCode: string,
    newCode: string,
    language: string,
    onClose: () => void
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed bg-black/40 inset-0 flex items-center justify-center z-100">
                    <motion.div
                        className="bg-blue-900 p-10 opacity-100 rounded-xl w-11/12 max-w-4xl h-4/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <motion.div
                            className="bg-gray-900/75 p-6 rounded-xl h-full flex flex-col"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}>
                            <h2 className="text-xl font-semibold text-white mb-4">Code Changes</h2>
                            <div className="flex-grow mb-4">
                                <DiffEditor
                                    height="100%"
                                    width="100%"
                                    original={oldCode}
                                    modified={newCode}
                                    language={language}
                                    theme="vs-dark"
                                    options={{
                                        readOnly: true,
                                        renderSideBySide: true,
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}