"use client";
import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
    offscreen: {
        y: 250,
        rotate: -5,
        opacity: 0.8,
    },
    onscreen: {
        y: 0,
        opacity: 1,
        rotate: -3,
        transition: {
            type: "spring",
            bounce: 0.35,
            duration: 0.8,
        },
    },
};

const hue = (h: number) => `hsl(${h}, 100%, 50%)`


const splash: React.CSSProperties = {
    position: "absolute",
    width: 300,
    height: 400,
    clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
}

const card: React.CSSProperties = {
    fontSize: 24,
    width: 180,
    height: 300,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    background: "#f5f5f5",
    transformOrigin: "10% 60%",
    color: "black"
}

interface CardProps {
    category: string
    hueA: number
    hueB: number
    i: number
}

export default function CategoryCard({ category, hueA, hueB }: CardProps) {
    const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`;
    console.log(category)
    return (
        <motion.div
            className="w-full flex justify-center"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.8, once: false }}
            style={{ overflow: "hidden" }}
        >
            <div
                style={{
                    position: "relative",
                    width: 300,
                    height: 400,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                }}
            >
                <div
                    style={{
                        ...splash,
                        background,
                    }}
                />

                <motion.div
                    // id={`category-card-${category}`}
                    variants={cardVariants}
                    style={{
                        ...card,
                    }}
                >
                    {category}
                </motion.div>
            </div>
        </motion.div>
    );
}