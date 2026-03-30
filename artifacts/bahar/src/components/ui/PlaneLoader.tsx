import { motion } from "framer-motion";

interface PlaneLoaderProps {
  fullPage?: boolean;
  text?: string;
}

export function PlaneLoader({ fullPage = false, text = "Loading..." }: PlaneLoaderProps) {
  const wrapper = fullPage
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-secondary"
    : "flex flex-col items-center justify-center py-20 w-full";

  return (
    <div className={wrapper}>
      {/* Sky / track area */}
      <div className="relative w-72 h-24 overflow-hidden">
        {/* Dashed trail track */}
        <div className="absolute top-1/2 left-0 right-0 flex items-center gap-1 -translate-y-1/2 px-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-0.5 flex-1 rounded-full bg-primary/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Floating clouds */}
        {[
          { top: "10%", delay: 0, scale: 0.6 },
          { top: "60%", delay: 0.6, scale: 0.4 },
        ].map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10 text-3xl pointer-events-none select-none"
            style={{ top: cloud.top }}
            initial={{ x: "110%" }}
            animate={{ x: "-20%" }}
            transition={{
              duration: 4.5 + i,
              repeat: Infinity,
              ease: "linear",
              delay: cloud.delay,
            }}
          >
            ☁
          </motion.div>
        ))}

        {/* The plane */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          initial={{ x: "-10%" }}
          animate={{ x: "90%" }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Vertical wobble */}
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              width="48"
              height="28"
              viewBox="0 0 48 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Fuselage */}
              <ellipse cx="22" cy="14" rx="18" ry="5" fill="#D4AF37" />
              {/* Nose cone */}
              <path d="M40 14 C44 14 48 14 48 14 C46 11 42 10 40 12 Z" fill="#C49B2A" />
              {/* Tail fin */}
              <path d="M4 14 C4 14 2 8 8 8 L14 14 Z" fill="#C49B2A" />
              {/* Tail horizontal stabilizer */}
              <path d="M6 14 C6 14 4 17 8 17 L12 14 Z" fill="#C49B2A" />
              {/* Main wing */}
              <path d="M18 14 L28 5 L32 5 L26 14 Z" fill="#B8921E" opacity="0.9" />
              <path d="M18 14 L28 23 L32 23 L26 14 Z" fill="#B8921E" opacity="0.9" />
              {/* Window */}
              <circle cx="30" cy="12" r="2" fill="#FFF9E6" opacity="0.7" />
              <circle cx="35" cy="12" r="2" fill="#FFF9E6" opacity="0.7" />
              {/* Engine */}
              <ellipse cx="22" cy="19" rx="5" ry="2.5" fill="#A07818" />
              <ellipse cx="22" cy="9" rx="5" ry="2.5" fill="#A07818" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Exhaust trail dots behind the plane */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/50"
            initial={{ x: "10%", opacity: 0.8, scale: 1 }}
            animate={{ x: "-5%", opacity: 0, scale: 0.2 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Text */}
      <motion.p
        className={`font-serif text-sm tracking-widest uppercase mt-4 ${fullPage ? "text-primary" : "text-muted-foreground"}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
}
