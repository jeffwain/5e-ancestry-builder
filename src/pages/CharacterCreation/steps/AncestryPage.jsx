import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../../../contexts/CharacterContext';
import { SummaryTraitCard } from '../../../components/SummaryTraitCard';
import '../../CharacterCreationPage.css';

const stepNumber = 4;
const stepTitle = 'Determine your ancestry';
const stepPath = '/character/ancestry';
const stepId = 'step-ancestry';

export function AncestryStepCard() {
  const navigate = useNavigate();

  return (
    <section className="creation-step card card-large" id={stepId}>
      <details open>
        <summary>
          <Link to={stepPath} className="step-link">
            {stepNumber}. {stepTitle}
          </Link>
        </summary>
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
  );
}

export function AncestrySummaryCard() {
  const {
    selectedTraits,
    selectedOptions,
    pointsSpent,
    ancestryName,
    traitTypes
  } = useCharacter();

  const traitsByType = useMemo(() => {
    const grouped = {};
    selectedTraits.forEach(trait => {
      const typeId = trait.type || 'unknown';
      if (!grouped[typeId]) {
        grouped[typeId] = {
          name: traitTypes[typeId]?.name || 'Custom Traits',
          traits: []
        };
      }
      grouped[typeId].traits.push(trait);
    });
    return Object.values(grouped);
  }, [selectedTraits, traitTypes]);

  if (selectedTraits.length === 0) {
    return (
      <div className="summary-card card">
        <h4>{stepNumber}. {stepTitle}</h4>
        <p className="summary-placeholder">No ancestry selected yet</p>
      </div>
    );
  }

  return (
    <div className="ancestry-summary">
      <h2 className="ancestry-summary-title">
        {ancestryName || 'Custom Ancestry'}
      </h2>
      <p className="ancestry-summary-desc">{pointsSpent}/16 points</p>

      {traitsByType.map((typeGroup) => (
        <div key={typeGroup.name} className="ancestry-summary-section">
          <h3>{typeGroup.name}</h3>
          <div className="ancestry-summary-traits">
            {typeGroup.traits.map(trait => (
              <SummaryTraitCard
                key={trait.id}
                trait={trait}
                selectedOptions={selectedOptions}
                showFooter={false}
                showDetails={false}
                compact={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ancestryStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: AncestryStepCard,
  SummaryCard: AncestrySummaryCard,
};

export function AncestryPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Determine Your Ancestry</h1>
        </header>

        <AncestryStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
