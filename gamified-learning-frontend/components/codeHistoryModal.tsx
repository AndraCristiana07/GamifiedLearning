"use client"

import { motion, AnimatePresence } from "framer-motion";

export default function CodeHistoryModal( {
    open,
    history,
    setAnswer,
    clearHistory,
    onClose
}: {
    open: boolean,
    history: { code: string; timestamp: string; tag: string }[],
    setAnswer: (code: string) => void,
    clearHistory: () => void,
    onClose: () => void
}) {
    function handleRestore(code: string) {
        // Implement restore functionality here
        setAnswer(code);
        
        onClose();
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed bg-black inset-0 flex items-center justify-center z-50 ">
                    <motion.div
                        className="bg-grey-900 p-10 inset-0 flex opacity-100 rounded-xl max-h-[80vh] overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <motion.div
                            className="bg-grey-900/75 p-6 rounded-xl text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}>
                            <h2 className="text-xl font-semibold text-white mb-4">Code History</h2>
                            <div className="columns-1 md:columns-2 lg:columns-3 flex flex-wrap gap-8 justify-center">
                                {history.map((entry, index) => (
                                    <div key={index} className="bg-gray-800 p-4 rounded text-left break-inside-avoid">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                            <span className="text-sm text-indigo-400 font-semibold ml-2">{entry.tag}</span>
                                            <button className="ml-4 bg-gray-700 px-2 py-1 rounded text-sm font-semibold cursor-pointer"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(entry.code);
                                                }}>
                                                Copy
                                            </button>
                                            <button className="ml-2 bg-green-700 px-2 py-1 rounded text-sm font-semibold cursor-pointer"
                                                onClick={() => handleRestore(entry.code)}>
                                                Restore
                                            </button>

                                        </div>
                                        <pre className="bg-gray-900 p-2 rounded text-sm overflow-x-auto">
                                            <code>{entry.code}</code>
                                        </pre>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-6 bg-blue-600 hover:bg-blue-500 rounded px-4 py-2 text-white cursor-pointer"
                                onClick={onClose}>
                                Close
                            </button>
                            <button className="mt-6 ml-4 bg-red-600 hover:bg-red-500 rounded px-4 py-2 text-white cursor-pointer"
                                onClick={clearHistory}>
                                Clear History
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}