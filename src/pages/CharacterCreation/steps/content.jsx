import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../../../contexts/CharacterContext';
import { TraitGroupList } from '../../../components/TraitGroupList';
import { groupTraitsByType, groupsFromTraitsByType } from '../../../utils/traitDisplay';
import '../../CharacterCreationPage.css';

/**
 * Step definitions for the Character Creation page.
 *
 * Each step is { id, number, title, Content, SummaryCard? }. The shared
 * wrappers (StepCard / StepSummaryCard in StepCard.jsx) own all layout;
 * this file owns only the content. Steps that track real character state
 * provide their own SummaryCard (currently just the ancestry step).
 */

export function IdeaContent() {
  return (
    <>
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
    </>
  );
}

export function ClassContent() {
  return (
    <p>
      After you have a rough idea, consider the class you want to play and how it
      fits the idea of your character or change your approach.
    </p>
  );
}

export function BackgroundContent() {
  return (
    <>
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
    </>
  );
}

export function AncestryContent() {
  const navigate = useNavigate();

  return (
    <>
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
    </>
  );
}

export function AncestrySummaryCard({ step }) {
  const {
    selectedTraits,
    selectedOptions,
    pointsSpent,
    ancestryName,
    traitTypes
  } = useCharacter();

  const traitsByType = useMemo(
    () => groupTraitsByType(selectedTraits, traitTypes),
    [selectedTraits, traitTypes]
  );

  if (selectedTraits.length === 0) {
    return (
      <div className="summary-card card">
        <h4>{step.number}. {step.title}</h4>
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

      <TraitGroupList groups={groupsFromTraitsByType(traitsByType, selectedOptions)} />
    </div>
  );
}

export function AbilityScoresContent() {
  return (
    <>
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
    </>
  );
}

export function ProficienciesContent() {
  return (
    <p>
      Choose two skills that match your <strong>background</strong> or{' '}
      <strong>ancestry</strong>. Your character gains proficiency in them.
    </p>
  );
}

export function ToolsContent() {
  return (
    <p>
      Choose <strong>one tool</strong>—an artisan's tool, vehicle type, gaming set,
      or instrument. Your character gains proficiency in it.
    </p>
  );
}

export function LanguagesContent() {
  return (
    <>
      <p>
        Your character can speak, read, and write <strong>Common and one other
        language</strong> that you and your DM agree is appropriate for the character
        from the languages available in this campaign.
      </p>
      <p>
        If your character can't speak another language, you gain proficiency with a
        second tool matching your background.
      </p>
    </>
  );
}

export function FeatContent() {
  return (
    <p>
      Whether by divine blessing, dubious bargain, genetic lottery, or good
      old-fashioned hard work, you are a cut above the rest.{' '}
      <strong>Take a starting feat that fits your character.</strong> Pick
      something for flavor that isn't combat based. For example, avoid Great
      Weapon Fighter or similar feats at level 1.
    </p>
  );
}
