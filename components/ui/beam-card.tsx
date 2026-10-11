'use client'
import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from "@/lib/utils";

export interface BeamCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  enableTilt?: boolean;
  beamColor?: "white" | "mint" | "cyan";
}

export function BeamCard({
  children,
  className,
  innerClassName,
  enableTilt = true,
  beamColor = "white",
}: BeamCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const beamGradientH =
    beamColor === "mint"
      ? "from-transparent via-[#3ddc84] to-transparent"
      : beamColor === "cyan"
      ? "from-transparent via-[#38bdf8] to-transparent"
      : "from-transparent via-white to-transparent";

  const beamGradientV =
    beamColor === "mint"
      ? "from-transparent via-[#3ddc84] to-transparent"
      : beamColor === "cyan"
      ? "from-transparent via-[#38bdf8] to-transparent"
      : "from-transparent via-white to-transparent";

  const glowDotColor =
    beamColor === "mint" ? "bg-[#3ddc84]/80" : beamColor === "cyan" ? "bg-[#38bdf8]/80" : "bg-white/80";

  return (
    <div className={cn("relative z-10 w-full", className)} style={{ perspective: 1200 }}>
      <motion.div
        className="relative h-full"
        style={enableTilt ? { rotateX, rotateY } : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative group h-full">
          {/* Card ambient perimeter glow on hover */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 14px 2px rgba(255,255,255,0.04)",
                "0 0 24px 6px rgba(255,255,255,0.08)",
                "0 0 14px 2px rgba(255,255,255,0.04)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          />

          {/* Traveling perimeter light beams */}
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none z-20">
            {/* Top light beam */}
            <motion.div
              className={cn("absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r opacity-80", beamGradientH)}
              initial={{ filter: "blur(0.5px)" }}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.9, 0.3],
                filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"],
              }}
              transition={{
                left: { duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 },
                opacity: { duration: 1.6, repeat: Infinity, repeatType: "mirror" },
              }}
            />
            {/* Right light beam */}
            <motion.div
              className={cn("absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b opacity-80", beamGradientV)}
              initial={{ filter: "blur(0.5px)" }}
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.3, 0.9, 0.3],
                filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"],
              }}
              transition={{
                top: { duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 0.8 },
                opacity: { duration: 1.6, repeat: Infinity, repeatType: "mirror", delay: 0.8 },
              }}
            />
            {/* Bottom light beam */}
            <motion.div
              className={cn("absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r opacity-80", beamGradientH)}
              initial={{ filter: "blur(0.5px)" }}
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.3, 0.9, 0.3],
                filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"],
              }}
              transition={{
                right: { duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 1.6 },
                opacity: { duration: 1.6, repeat: Infinity, repeatType: "mirror", delay: 1.6 },
              }}
            />
            {/* Left light beam */}
            <motion.div
              className={cn("absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b opacity-80", beamGradientV)}
              initial={{ filter: "blur(0.5px)" }}
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.3, 0.9, 0.3],
                filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"],
              }}
              transition={{
                bottom: { duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 2.4 },
                opacity: { duration: 1.6, repeat: Infinity, repeatType: "mirror", delay: 2.4 },
              }}
            />

            {/* Corner glow spots */}
            <motion.div
              className={cn("absolute top-0 left-0 h-[4px] w-[4px] rounded-full blur-[1px]", glowDotColor)}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              className={cn("absolute top-0 right-0 h-[5px] w-[5px] rounded-full blur-[1px]", glowDotColor)}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.6 }}
            />
            <motion.div
              className={cn("absolute bottom-0 right-0 h-[5px] w-[5px] rounded-full blur-[1px]", glowDotColor)}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }}
            />
            <motion.div
              className={cn("absolute bottom-0 left-0 h-[4px] w-[4px] rounded-full blur-[1px]", glowDotColor)}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.8 }}
            />
          </div>

          {/* Clean Glass card background */}
          <div
            className={cn(
              "relative h-full bg-[#080b11]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 group-hover:border-white/20",
              innerClassName
            )}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default BeamCard;
