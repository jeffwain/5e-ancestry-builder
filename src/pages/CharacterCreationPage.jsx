import { useNavigate } from 'react-router-dom';
import './CharacterCreationPage.css';

export function CharacterCreationPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Creating a Character</h1>
        </header>

        <section className="creation-step card card-large">
          <details open>
            <summary>1. Think of a character idea</summary>
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
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>2. Choose your class</summary>
            <div className="step-content">
              <p>
                After you have a rough idea, consider the class you want to play and how it
                fits the idea of your character or change your approach.
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>3. Think of a background</summary>
            <div className="step-content">
              <p>
                After you have a rough outline in mind, think of what brought your character
                to where they are today? What is a significant job or role in their past that
                shaped their worldview or experiences?
              </p>
              <p>
                Pick a default background for the ability it gives you, or work with your DM
                to create a custom background. You will gain at least one special ability
                through your background. <strong>The skills, tools, and proficiencies given
                by default backgrounds are just guides. Use those as inspiration for your
                choices here.</strong>
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>4. Determine your ancestry</summary>
            <div className="step-content">
              <p>
                <strong>Start by determining what you look like and what species make up your
                unique ancestry.</strong> You can choose a premade species from the list below,
                or work with your DM to build your own. The species available to you in your
                game are determined by your DM.
              </p>

              <h4>Pick a premade ancestry...</h4>
              <p>
                The simplest option is to pick an existing ancestry. Or, you can work with
                your DM who has some prebuilt stat blocks for different species that exist
                in this world. Each species has various ancestries and a recommended set of
                traits to use for your character.
              </p>

              <div className="ancestry-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/ancestries')}
                >
                  Browse Premade Ancestries
                </button>
              </div>

              <h4>...or build your own</h4>
              <p>
                Create a completely custom ancestry using the point-buy system.
              </p>

              <div className="ancestry-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/customancestry')}
                >
                  Build Custom Ancestry
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>5. Determine your ability scores</summary>
            <div className="step-content">
              <p>
                Using the <strong>Point Buy</strong> system, determine your base ability scores.
              </p>
              <p>
                <strong>When determining your ability scores, increase one of those scores by
                2 and increase a different score by 1. Or, increase three different scores by
                1.</strong> You follow this rule regardless of the method you use to determine
                the scores, such as rolling or point buy.
              </p>
              <p>
                Your class's "Quick Build" section offers suggestions on which scores to
                increase. You're free to follow those suggestions or to ignore them.
                Whichever scores you decide to increase, <em>none of the scores can be
                raised above 20</em>.
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>6. Choose skill proficiencies</summary>
            <div className="step-content">
              <p>
                Choose two skills that match your <strong>background</strong> or{' '}
                <strong>ancestry</strong>. Your character gains proficiency in them.
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>7. Choose a tool proficiency</summary>
            <div className="step-content">
              <p>
                Choose <strong>one tool</strong>—an artisan's tool, vehicle type, gaming set,
                or instrument. Your character gains proficiency in it.
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>8. Choose languages you speak</summary>
            <div className="step-content">
              <p>
                Your character can speak, read, and write <strong>Common and one other
                language</strong> that you and your DM agree is appropriate for the character
                from the languages available in this campaign.
              </p>
              <p>
                If your character can't speak another language, you gain proficiency with a
                second tool matching your background.
              </p>
            </div>
          </details>
        </section>

        <section className="creation-step card card-large">
          <details open>
            <summary>9. Take a starting feat</summary>
            <div className="step-content">
              <p>
                Whether by divine blessing, dubious bargain, genetic lottery, or good
                old-fashioned hard work, you are a cut above the rest.{' '}
                <strong>Take a starting feat that fits your character.</strong> Pick
                something for flavor that isn't combat based. For example, avoid Great
                Weapon Fighter or similar feats at level 1.
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
