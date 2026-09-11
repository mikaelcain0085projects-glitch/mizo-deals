"use client";

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  size: `${2 + (index % 3)}px`,
  delay: `${(index % 6) * 1.2}s`,
  duration: `${10 + (index % 5) * 2}s`,
}));

export default function FloatingParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-white opacity-[0.12] animate-mizo-float"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}