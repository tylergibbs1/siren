"use client";

import React from "react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";

interface Task {
  id: string;
  label: string;
  score: number;
  actors?: string[];
}

interface Section {
  label: string;
  tasks: Task[];
}

interface UserJourneyProps {
  title?: string;
  sections: Section[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

const SCORE_COLORS = [
  "#e5484d", // 1 - very negative
  "#f76b15", // 2 - negative
  "#ffc53d", // 3 - neutral
  "#30a46c", // 4 - positive
  "#0090ff", // 5 - very positive
];

function getScoreColor(score: number): string {
  const idx = Math.max(0, Math.min(4, Math.round(score) - 1));
  return SCORE_COLORS[idx]!;
}

const TASK_HEIGHT = 40;
const TASK_GAP = 8;
const SECTION_PADDING = 16;
const LEFT_COL = 160;
const TASK_WIDTH = 200;

const CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--siren-font, system-ui)",
};

const SVG_STYLE: React.CSSProperties = { maxWidth: "100%", height: "auto" };

function UserJourneyInner({
  title,
  sections,
  className,
  style,
}: Omit<UserJourneyProps, "theme">) {
  const totalTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);
  const totalSections = sections.length;

  const svgHeight =
    (title ? 40 : 0) +
    totalTasks * (TASK_HEIGHT + TASK_GAP) +
    totalSections * (SECTION_PADDING * 2 + 24) +
    20;
  const svgWidth = LEFT_COL + TASK_WIDTH + 80;

  let yOffset = title ? 48 : 16;

  return (
    <div
      className={className}
      style={style ? { ...CONTAINER_STYLE, ...style } : CONTAINER_STYLE}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={SVG_STYLE}
        role="img"
        aria-label={title ?? "User journey"}
      >
        <title>{title ?? "User journey"}</title>
        {title ? (
          <text
            x={svgWidth / 2}
            y={28}
            textAnchor="middle"
            fontFamily="var(--siren-font, system-ui)"
            fontSize="16"
            fontWeight="500"
            fill="var(--siren-text, #1e293b)"
          >
            {title}
          </text>
        ) : null}

        {sections.map((section, sIdx) => {
          const sectionStartY = yOffset;
          const sectionHeight =
            24 + section.tasks.length * (TASK_HEIGHT + TASK_GAP) + SECTION_PADDING;

          const sectionEl = (
            <g key={`section-${sIdx}`}>
              {/* Section background */}
              <rect
                x={4}
                y={sectionStartY}
                width={svgWidth - 8}
                height={sectionHeight}
                rx={6}
                fill="var(--siren-surface, hsl(0 0% 9%))"
                stroke="var(--siren-node-border, hsl(0 0% 18%))"
                strokeWidth={1}
              />
              {/* Section label */}
              <text
                x={LEFT_COL / 2}
                y={sectionStartY + 20}
                textAnchor="middle"
                fontFamily="var(--siren-font, system-ui)"
                fontSize="13"
                fontWeight="500"
                fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
              >
                {section.label}
              </text>

              {/* Tasks */}
              {section.tasks.map((task, tIdx) => {
                const taskY =
                  sectionStartY + 30 + tIdx * (TASK_HEIGHT + TASK_GAP);
                const color = getScoreColor(task.score);
                const barWidth =
                  (task.score / 5) * (TASK_WIDTH - 16);

                return (
                  <g key={task.id}>
                    {/* Task background */}
                    <rect
                      x={LEFT_COL}
                      y={taskY}
                      width={TASK_WIDTH}
                      height={TASK_HEIGHT}
                      rx={4}
                      fill="var(--siren-surface-raised, hsl(0 0% 12.2%))"
                      stroke="var(--siren-node-border, hsl(0 0% 18%))"
                      strokeWidth={1}
                    />
                    {/* Score bar */}
                    <rect
                      x={LEFT_COL + 8}
                      y={taskY + TASK_HEIGHT - 8}
                      width={barWidth}
                      height={4}
                      rx={2}
                      fill={color}
                      opacity={0.8}
                    />
                    {/* Task label */}
                    <text
                      x={LEFT_COL + 8}
                      y={taskY + 20}
                      fontFamily="var(--siren-font, system-ui)"
                      fontSize="12"
                      fill="var(--siren-text, #1e293b)"
                    >
                      {task.label}
                    </text>
                    {/* Score badge */}
                    <circle
                      cx={LEFT_COL + TASK_WIDTH + 20}
                      cy={taskY + TASK_HEIGHT / 2}
                      r={12}
                      fill={color}
                      opacity={0.2}
                    />
                    <text
                      x={LEFT_COL + TASK_WIDTH + 20}
                      y={taskY + TASK_HEIGHT / 2 + 4}
                      textAnchor="middle"
                      fontFamily="var(--siren-font, system-ui)"
                      fontSize="11"
                      fontWeight="600"
                      fill={color}
                    >
                      {task.score}
                    </text>
                  </g>
                );
              })}
            </g>
          );

          yOffset = sectionStartY + sectionHeight + 12;
          return sectionEl;
        })}
      </svg>
    </div>
  );
}

export function UserJourney({ theme, ...props }: UserJourneyProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <UserJourneyInner {...props} />
      </SirenProvider>
    );
  }

  return <UserJourneyInner {...props} />;
}
