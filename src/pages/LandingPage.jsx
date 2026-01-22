import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <header className="landing-header">
          <h1>Custom Ancestry Builder</h1>
          <p className="subtitle">Build unique character ancestries for 5th Edition</p>
        </header>

        <section className="landing-section">
          <h2>What is a Custom Ancestry?</h2>
          <p>
            The Custom Ancestry system lets you build a character's heritage from the ground up
            using a point-buy system. Instead of choosing a pre-defined race with fixed traits,
            you allocate points across different ancestral features to create exactly the
            character you envision.
          </p>
        </section>

        <section className="landing-section">
          <h2>Building Your Ancestry</h2>
          <p>
            You have <strong>16 points</strong> to spend on ancestral traits. These are divided
            into three categories:
          </p>
          <ul>
            <li>
              <strong>Core Attributes</strong> — Size, speed, and fundamental physical traits
            </li>
            <li>
              <strong>Heritage Traits</strong> — Biological and innate abilities from your lineage
            </li>
            <li>
              <strong>Culture Traits</strong> — Skills and proficiencies from your upbringing
            </li>
          </ul>
        </section>

        <section className="landing-section">
          <h2>Getting Started</h2>
          <p>Choose how you'd like to build your character's ancestry:</p>

          <div className="landing-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={() => navigate('/builder')}
            >
              Build Custom Ancestry
              <span className="btn-desc">Start from scratch with full control</span>
            </button>

            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/ancestries')}
            >
              Browse Ancestries
              <span className="btn-desc">View pre-built ancestry options</span>
            </button>
          </div>
        </section>

        <section className="landing-section">
          <h2>Point Costs</h2>
          <p>
            Each trait has a point cost based on its power level. Some traits are free (0 points),
            while powerful abilities may cost 4-6 points. A few traits have negative costs,
            giving you extra points in exchange for a drawback.
          </p>
          {/* TODO: Add a sample trait cost breakdown table here */}
        </section>

        <section className="landing-section">
          <h2>Required Choices</h2>
          <p>
            Some categories require you to make a selection. At minimum, you must choose:
          </p>
          <ul>
            <li>A <strong>Size</strong> (Medium or Small)</li>
            <li>A <strong>Walking Speed</strong> (30 ft. is free)</li>
          </ul>
          <p>
            Everything else is optional — build lean with just a few defining traits,
            or spend all 16 points on a richly detailed heritage.
          </p>
        </section>
      </div>
    </div>
  );
}
