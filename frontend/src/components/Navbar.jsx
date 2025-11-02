import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="landing-nav">
      <motion.h1
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Pints With Friends
      </motion.h1>

      <div className="nav-buttons">
        {[
          { label: "Dashboard", route: "/dashboard" },
          { label: "Pint History", route: "/history" },
          { label: "Add Pint", route: "/add-pint" },
        ].map((btn, idx) => (
          <motion.button
            key={idx}
            className="btn-primary"
            onClick={() => navigate(btn.route)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
