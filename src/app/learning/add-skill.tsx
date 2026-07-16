"use client";

import { useState } from "react";

import { PRIMARY_BUTTON_CLASSES } from "@/components/form";

import { createSkill } from "./actions";
import { SkillForm } from "./skill-form";

export function AddSkill() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={PRIMARY_BUTTON_CLASSES}
      >
        Add Skill
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-sage/30 border-l-[3px] border-l-rose bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">Add Skill</h2>
      <SkillForm
        action={createSkill}
        submitLabel="Create Skill"
        confirmEntity="skill"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
