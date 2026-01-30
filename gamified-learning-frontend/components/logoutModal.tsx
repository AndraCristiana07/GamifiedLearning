"use client"

import { motion, AnimatePresence } from "framer-motion";

export default function LogoutModal({
    open,
    onConfirm,
    onCancel
}: {
    open: boolean,
    onConfirm: () => void,
    onCancel: () => void
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed bg-black/40 inset-0 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-blue-900 p-10 opacity-100 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <motion.div
                            className="bg-grey-900/75 p-6 rounded-xl text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}>
                            <h2 className="text-xl font-semibold text-white mb-4">Log out?</h2>
                            <p className="text-grey-400 mb-6"> Are you sure you want to log out?</p>
                            <div className="flex justify-between gap-5">
                                <button className="flex bg-grey-700 hover:bg-grey-500 rounded px-4 py-2"
                                    onClick={onCancel}>
                                    Cancel
                                </button>
                                <button className="flex bg-red-700 hover:bg-red-500 rounded px-4 py-2 text-white"
                                    onClick={onConfirm}>
                                    Logout
                                </button>

                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}