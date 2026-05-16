const workflows = [
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
        title: "Choose the local dev folder",
        detail: "Open a terminal in the directory where project folders should live.",
      },
      {
        title: "Clone the repo locally",
        commands: [
          {
            text: "gh repo clone OWNER/REPO",
            note: "Downloads the GitHub repository into a new local project folder.",
          },
        ],
      },
      {
        title: "Enter the project folder",
        commands: [
          {
            text: "cd REPO",
            note: "Moves the terminal into the cloned project folder.",
          },
        ],
      },
      {
        title: "Confirm remote tracking",
        commands: [
          {
            text: "git remote -v",
            note: "Shows the remote repositories for this project. The -v flag means verbose, so Git includes the full fetch and push URLs.",
          },
          {
            text: "git status",
            note: "Checks the current branch and whether local changes are staged, unstaged, or untracked.",
          },
        ],
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
        commands: [
          {
            text: "git status",
            note: "Checks the current branch and whether local changes are staged, unstaged, or untracked.",
          },
        ],
      },
      {
        title: "Create and switch to a branch",
        commands: [
          {
            text: "git switch -c feature-name",
            note: "Creates a new branch and moves your working copy onto it. The -c flag tells Git to create the branch before switching.",
          },
        ],
      },
      {
        title: "Stage changes",
        commands: [
          {
            text: "git add .",
            note: "Stages all current file changes so they will be included in the next commit.",
          },
        ],
      },
      {
        title: "Commit changes",
        commands: [
          {
            text: 'git commit -m "Describe the change"',
            note: "Saves the staged changes as a local commit. The -m flag lets you write the commit message directly in the command.",
          },
        ],
      },
      {
        title: "Push branch",
        commands: [
          {
            text: "git push -u origin feature-name",
            note: "Uploads the branch to GitHub. The -u flag sets upstream tracking so future git push and git pull commands know which remote branch to use.",
          },
        ],
      },
      {
        title: "Open a PR",
        commands: [
          {
            text: "gh pr create --web",
            note: "Starts a pull request for the current branch. The --web flag opens GitHub's pull request form in the browser.",
          },
        ],
      },
      {
        title: "After review or approval, merge",
        commands: [
          {
            text: "gh pr merge --squash --delete-branch",
            note: "Merges the pull request. The --squash flag combines the branch into one commit, and --delete-branch removes the remote feature branch after merging.",
          },
        ],
      },
      {
        title: "Update local main",
        commands: [
          {
            text: "git switch main",
            note: "Moves your working copy back to the main branch.",
          },
          {
            text: "git pull",
            note: "Downloads and applies the latest commits from GitHub to your local main branch.",
          },
        ],
      },
    ],
  },
];

const checked = new Set();
const progress = document.querySelector("#progress");
const workflowRoot = document.querySelector("#workflows");
const totalSteps = workflows.reduce((count, workflow) => count + workflow.steps.length, 0);

function updateProgress() {
  progress.textContent = `${checked.size}/${totalSteps}`;
  progress.setAttribute("aria-label", `${checked.size} of ${totalSteps} steps complete`);
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

async function copyCommand(button, command) {
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Failed";
  }

  window.setTimeout(() => {
    button.textContent = "Copy";
  }, 1400);
}

function renderWorkflows() {
  workflows.forEach((workflow) => {
    const article = makeElement("article", "workflow");

    const heading = makeElement("div", "workflow-heading");
    heading.append(makeElement("h2", "", workflow.title));
    heading.append(makeElement("p", "", workflow.description));
    article.append(heading);

    const stepList = makeElement("ol", "step-list");

    workflow.steps.forEach((step, stepIndex) => {
      const stepId = `${workflow.id}-${stepIndex}`;
      const item = makeElement("li", "step");

      const label = makeElement("label", "step-check");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          checked.add(stepId);
        } else {
          checked.delete(stepId);
        }
        updateProgress();
      });

      label.append(checkbox);
      label.append(makeElement("span", "step-title", step.title));
      item.append(label);

      if (step.detail) {
        item.append(makeElement("p", "step-detail", step.detail));
      }

      if (step.commands) {
        const commands = makeElement("div", "commands");
        step.commands.forEach((command) => {
          const commandText = typeof command === "string" ? command : command.text;
          const row = makeElement("div", "command-row");
          row.append(makeElement("code", "", commandText));

          const button = makeElement("button", "", "Copy");
          button.type = "button";
          button.addEventListener("click", () => copyCommand(button, commandText));
          row.append(button);

          commands.append(row);
          if (command.note) {
            commands.append(makeElement("p", "command-note", command.note));
          }
        });
        item.append(commands);
      }

      stepList.append(item);
    });

    article.append(stepList);
    workflowRoot.append(article);
  });
}

renderWorkflows();
updateProgress();
