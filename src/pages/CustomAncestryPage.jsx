import { useNavigate } from 'react-router-dom';
import './CustomAncestryPage.css';

export function CustomAncestryPage() {
  const navigate = useNavigate();

  return (
    <div className="custom-ancestry-page">
      <div className="ancestry-content">
        <header className="ancestry-header">
          <h1>Creating a Custom Ancestry</h1>
        </header>

        <section className="ancestry-step">
          <details open>
            <summary>1. Think of your background</summary>
            <div className="step-content">
              <p>
                Your first step in creating a character is to consider your character's species,
                ancestry, the culture they grew up in, and any exceptional occurrences that may
                have shaped them. As you make choices about your character's features, think up
                a few key characteristics of your character's past.
              </p>
              <ul>
                <li>Where did they spend most of their time?</li>
                <li>What did they do for a living?</li>
                <li>What capabilities and possessions did they acquire?</li>
                <li>What language did they learn from their family, associates, or studies?</li>
                <li>How did their past affect their physical abilities?</li>
              </ul>
              <p>
                <strong>Start by determining what you look like and what species make up your
                unique ancestry.</strong> You can choose a premade species from the list below,
                or use this resource to build your own. The species available to you in your
                game are determined by your DM. If you use this resource, you choose which
                ability scores you are proficient in, your size, if you have darkvision,
                individuals representing your ancestry, cultures representing your shaping
                influences, and what languages you know.
              </p>
              <p>
                Once you have a character in mind, follow these steps in order, making decisions
                that reflect your character best. Your character will likely evolve with each
                choice you make. What's important is that you come to the table with a character
                you're excited to play.
              </p>

              <h4>Pick a premade ancestry...</h4>
              <p>
                The simplest option is to pick an existing ancestry. Or, you can work with your
                DM who has some prebuilt stat blocks for different species that exist in this
                world. Each species has various ancestries and a recommended set of traits to
                use for your character. If you choose a premade build, skip to step 9 on the
                Character Creation page.
              </p>

              <div className="ancestry-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/ancestries')}
                >
                  Browse Premade Ancestries
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>2. Determine your creature type</summary>
            <div className="step-content">
              <p>
                Every creature in D&D, including every player character, has a special tag in
                the rules that identifies the type of creature they are. Most player characters
                are of the Humanoid type. Unless you and your DM decide otherwise, your
                character's creature type is Humanoid.
              </p>
              <p>
                The game's creature types include: Aberration, Beast, Celestial, Construct,
                Dragon, Elemental, Fey, Fiend, Giant, Humanoid, Monstrosity, Ooze, Plant,
                Undead. These types don't have rules themselves, but some rules in the game
                affect creatures of certain types in different ways. For example, the text of
                the <em>cure wounds</em> spell specifies that the spell doesn't work on a
                creature of the Construct type.
              </p>

              <div className="callout">
                <h4>Heritage Point Spending Rules</h4>
                <p>
                  If you don't pick a premade ancestry, <strong>you have 16 points to spend
                  on your heritage traits.</strong> You may pick traits from <strong>up to
                  two Ancestries</strong> and <strong>up to two Cultures</strong>.
                </p>
                <p>
                  The cost of each score is shown in parenthesis following the name of the
                  trait. <strong>You can only take a uniquely named trait once, and you must
                  take at least one Culture heritage trait</strong>. For example, you can
                  only take one Cantrip trait. You are not required to spend all your
                  heritage trait points.
                </p>
              </div>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>3. Choose your size</summary>
            <div className="step-content">
              <p>
                Most species have individuals that vary in size, but tend to have an average
                that most fit into. Some species are only a certain size, such as goliaths
                (medium) or gnomes (small). Choose one of the following options:
              </p>
              <div className="ancestry-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/builder')}
                >
                  Go to Ancestry Builder
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>4. Set your base walking speed</summary>
            <div className="step-content">
              <p>
                Your base walking speed is 30 feet. Your base climbing and swimming speeds
                are half your walking speed. If you take a trait that grants flying, the
                speed equals your base walking speed. You can choose to increase this speed.
              </p>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>5. Can you see in the dark?</summary>
            <div className="step-content">
              <p>
                Not all species have the ability to naturally see in the dark. Choose if
                your ancestry grants you this ability.
              </p>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>6. Determine spellcasting ability</summary>
            <div className="step-content">
              <p>
                Your heritage may have gifted you the ability to cast certain spells.{' '}
                <strong>Intelligence, Wisdom, or Charisma</strong> is your spellcasting
                ability for any spell gained in this way. If the class you choose for your
                character cannot cast spells, you may choose <strong>Constitution</strong>{' '}
                as your heritage spellcasting ability instead.
              </p>
              <p>
                You may take <strong>at most one 1st-level and one 2nd-level spell through
                traits</strong>. 1st-level spells become available at level 3, and 2nd-level
                spells at level 5. Any spells taken through a trait do not take a material
                component to cast. Once you cast a spell from a trait, you can't cast that
                spell again until you finish a long rest. You can also cast these spells
                using any spell slots you have of the appropriate spell level.
              </p>
              <p>
                The "spells" you take through this ability may actually be spell-like
                properties of your ancestry rather than a magical spell. For example, a
                reptilian character's <em>acid splash</em> may represent their venomous spit.
              </p>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>7. Choose your ancestries</summary>
            <div className="step-content">
              <p>
                You can <strong>choose up to 2 ancestries</strong> from the following options
                to make up your heritage. The traits you choose represent the physical
                characteristics and skills of your character. If you are customizing an
                existing Ancestry Archetype, you may be required to pick certain ancestry
                traits from the options below.
              </p>
              <div className="ancestry-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/builder')}
                >
                  Go to Ancestry Builder
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="ancestry-step">
          <details open>
            <summary>8. Choose cultural traits</summary>
            <div className="step-content">
              <p>
                You can choose traits from <strong>up to 2 cultures</strong> from the
                following options to make up your heritage. <strong>You must take at least
                one cultural trait that costs one or more (1+) heritage points.</strong>
              </p>
              <p>
                Then{' '}
                <button
                  className="btn-link"
                  onClick={() => navigate('/')}
                >
                  head back to character creation
                </button>
                !
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
