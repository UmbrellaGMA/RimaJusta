
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check } from "lucide-react";

function MCNameInput({ mcNumber, currentName, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(currentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      onNameChange(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-border bg-card p-4">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder={`Nome do MC ${mcNumber}`}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Check className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{currentName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default MCNameInput;
