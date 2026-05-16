import { useMemo, useState } from "react";

type WorkflowStep = {
  title: string;
  detail?: string;
  commands?: string[];
};

type Workflow = {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
};

const workflows: Workflow[] = [
  {
    id: "new-project",
    title: "Start a new project",
    description: "Create the remote first, clone it locally, then confirm tracking.",
    steps: [
      {
        title: "Create the repo on GitHub",
        detail: "Use the GitHub UI or GitHub CLI. Keep the owner and repo name handy.",
      },
      {
        title: "Create or choose the local parent folder",
        detail: "Open a terminal in the directory where project folders should live.",
      },
      {
        title: "Clone the repo locally",
        commands: ["gh repo clone OWNER/REPO"],
      },
      {
        title: "Enter the project folder",
        commands: ["cd REPO"],
      },
      {
        title: "Confirm remote tracking",
        commands: ["git remote -v", "git status"],
      },
    ],
  },
  {
    id: "push-merge",
    title: "Push and merge a branch",
    description: "Make a focused branch, push it, open a PR, then refresh main.",
    steps: [
      {
        title: "Check current status",
        commands: ["git status"],
      },
      {
        title: "Create and switch to a branch",
        commands: ["git switch -c feature-name"],
      },
      {
        title: "Stage changes",
        commands: ["git add ."],
      },
      {
        title: "Commit changes",
        commands: ['git commit -m "Describe the change"'],
      },
      {
        title: "Push branch",
        commands: ["git push -u origin feature-name"],
      },
      {
        title: "Open a PR",
        commands: ["gh pr create --web"],
      },
      {
        title: "After review or approval, merge",
        commands: ["gh pr merge --squash --delete-branch"],
      },
      {
        title: "Update local main",
        commands: ["git switch main", "git pull"],
      },
    ],
  },
];

type CheckedState = Record<string, boolean>;
type CopyState = Record<string, string>;

function stepKey(workflowId: string, stepIndex: number) {
  return `${workflowId}-${stepIndex}`;
}

function App() {
  const [checked, setChecked] = useState<CheckedState>({});
  const [copied, setCopied] = useState<CopyState>({});

  const totals = useMemo(() => {
    const stepCount = workflows.reduce((count, workflow) => count + workflow.steps.length, 0);
    const doneCount = Object.values(checked).filter(Boolean).length;
    return { doneCount, stepCount };
  }, [checked]);

  async function copyCommand(key: string, command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied((current) => ({ ...current, [key]: command }));
    } catch {
      setCopied((current) => ({ ...current, [key]: "failed" }));
    }

    window.setTimeout(() => {
      setCopied((current) => {
        if (current[key] !== command && current[key] !== "failed") return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    }, 1400);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Git workflow reminders</p>
          <h1>Blockhaus</h1>
        </div>
        <div className="progress-pill" aria-label={`${totals.doneCount} of ${totals.stepCount} steps complete`}>
          {totals.doneCount}/{totals.stepCount}
        </div>
      </header>

      <section className="workflow-grid" aria-label="Git workflows">
        {workflows.map((workflow) => (
          <article className="workflow" key={workflow.id}>
            <div className="workflow-heading">
              <h2>{workflow.title}</h2>
              <p>{workflow.description}</p>
            </div>

            <ol className="step-list">
              {workflow.steps.map((step, stepIndex) => {
                const key = stepKey(workflow.id, stepIndex);
                return (
                  <li className="step" key={key}>
                    <label className="step-check">
                      <input
                        type="checkbox"
                        checked={Boolean(checked[key])}
                        onChange={(event) =>
                          setChecked((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                      />
                      <span className="step-title">{step.title}</span>
                    </label>

                    {step.detail ? <p className="step-detail">{step.detail}</p> : null}

                    {step.commands ? (
                      <div className="commands">
                        {step.commands.map((command, commandIndex) => {
                          const commandKey = `${key}-${commandIndex}`;
                          const copiedCommand = copied[commandKey] === command;
                          const failedCopy = copied[commandKey] === "failed";
                          return (
                            <div className="command-row" key={commandKey}>
                              <code>{command}</code>
                              <button type="button" onClick={() => copyCommand(commandKey, command)}>
                                {copiedCommand ? "Copied" : failedCopy ? "Failed" : "Copy"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
