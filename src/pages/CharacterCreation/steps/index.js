import {
  IdeaContent,
  ClassContent,
  BackgroundContent,
  AncestryContent,
  AncestrySelection,
  AbilityScoresContent,
  ProficienciesContent,
  ToolsContent,
  LanguagesContent,
  FeatContent,
} from './content';

/**
 * Step definitions for the Character Creation page.
 *
 * Each step is { id, number, title, Content, Selection?, isComplete? }. The
 * shared wrapper (StepCard in StepCard.jsx) owns all layout; content.jsx owns
 * only the content. Steps that track real character state provide a Selection
 * to show it and an isComplete(character) to check it off (currently just the
 * ancestry step).
 */
export const steps = [
  { id: 'step-idea', number: 1, title: 'Think of a character idea', Content: IdeaContent },
  { id: 'step-class', number: 2, title: 'Choose your class', Content: ClassContent },
  { id: 'step-background', number: 3, title: 'Think of a background', Content: BackgroundContent },
  { id: 'step-ancestry', number: 4, title: 'Determine your ancestry', Content: AncestryContent, Selection: AncestrySelection, isComplete: ({ selectedTraits }) => selectedTraits.length > 0 },
  { id: 'step-ability-scores', number: 5, title: 'Determine your ability scores', Content: AbilityScoresContent },
  { id: 'step-proficiencies', number: 6, title: 'Choose skill proficiencies', Content: ProficienciesContent },
  { id: 'step-tools', number: 7, title: 'Choose a tool proficiency', Content: ToolsContent },
  { id: 'step-languages', number: 8, title: 'Choose languages you speak', Content: LanguagesContent },
  { id: 'step-feat', number: 9, title: 'Take a starting feat', Content: FeatContent },
];
