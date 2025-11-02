import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="hero-title">
            Track your pints, <br /> celebrate your pubs.
          </h2>
          <p className="hero-subtitle">
            Pints With Friends helps you log your pints, discover your favorite spots,
            and see how your friends stack up on the leaderboard.
          </p>
          <motion.button
            className="btn-primary hero-btn"
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Dashboard
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.img
            src="/pints-illustration.svg"
            alt="Pint tracker illustration"
            className="illustration"
            whileHover={{ scale: 1.03, rotate: 2 }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features">
        {[
          {
            icon: "🍻",
            title: "Log every pint",
            desc: "Keep track of what you drank, where, and with whom.",
          },
          {
            icon: "📍",
            title: "Explore your map",
            desc: "See your pub history and discover your most visited locations.",
          },
          {
            icon: "🏆",
            title: "See how your friends rank!",
            desc: "Compare pint count on the leaderboard.",
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            className="feature-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            whileHover={{ scale: 1.03 }}
          >
            <h3>
              {feature.icon} {feature.title}
            </h3>
            <p>{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p>© {new Date().getFullYear()}</p>
      </motion.footer>
    </div>
  );
}
