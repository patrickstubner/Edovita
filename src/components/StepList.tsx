export interface StepListProps {
  heading: string;
  steps: readonly string[];
  hint?: string;
}

/**
 * Nummerierte Zubereitungsschritte, strikt in der App-Sprache (ADR-003).
 */
export function StepList({ heading, steps, hint }: StepListProps) {
  return (
    <section
      className="edo-card edo-stack"
      aria-labelledby="steps-heading"
      data-testid="step-list"
    >
      <h2 id="steps-heading">{heading}</h2>
      <ol className="edo-step-list">
        {steps.map((step, index) => (
          <li key={`step-${index + 1}`} className="edo-step-item">
            <span className="edo-step-num" aria-hidden="true">
              {index + 1}
            </span>
            <p className="edo-grow">{step}</p>
          </li>
        ))}
      </ol>
      {hint ? (
        <p className="edo-cap" data-testid="second-lang-steps-hint">
          {hint}
        </p>
      ) : null}
    </section>
  );
}
