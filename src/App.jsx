
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import BattleArena from "@/components/BattleArena";
import VideoPlayer from "@/components/VideoPlayer";
import StatsModal from "@/components/StatsModal";
import MCNameInput from "@/components/MCNameInput";

function App() {
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();
  const [battleState, setBattleState] = useState({
    currentRound: 1,
    mc1: { 
      name: "MC 1", 
      scores: [0, 0, 0],
      moves: [[], [], []] // Array of moves for each round
    },
    mc2: { 
      name: "MC 2", 
      scores: [0, 0, 0],
      moves: [[], [], []] // Array of moves for each round
    },
    videoUrl: "",
  });

  const resetBattle = () => {
    setBattleState({
      currentRound: 1,
      mc1: { 
        name: "MC 1", 
        scores: [0, 0, 0],
        moves: [[], [], []]
      },
      mc2: { 
        name: "MC 2", 
        scores: [0, 0, 0],
        moves: [[], [], []]
      },
      videoUrl: "",
    });
    toast({
      title: "Nova Batalha",
      description: "Placar zerado e pronto para nova batalha!",
    });
  };

  const updateMCName = (mcNumber, newName) => {
    setBattleState((prev) => ({
      ...prev,
      [`mc${mcNumber}`]: {
        ...prev[`mc${mcNumber}`],
        name: newName,
      },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="battle-container"
    >
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Rima Justa</h1>
        <p className="mt-2 text-muted-foreground">Sistema de Avaliação de MCs</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <MCNameInput
          mcNumber={1}
          currentName={battleState.mc1.name}
          onNameChange={(name) => updateMCName(1, name)}
        />
        <MCNameInput
          mcNumber={2}
          currentName={battleState.mc2.name}
          onNameChange={(name) => updateMCName(2, name)}
        />
      </div>

      <VideoPlayer
        videoUrl={battleState.videoUrl}
        setVideoUrl={(url) => setBattleState((prev) => ({ ...prev, videoUrl: url }))}
      />

      <BattleArena
        battleState={battleState}
        setBattleState={setBattleState}
      />

      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowStats(true)}
          className="w-40"
        >
          Ver Estatísticas
        </Button>
        <Button
          variant="destructive"
          onClick={resetBattle}
          className="w-40"
        >
          Nova Batalha
        </Button>
      </div>

      {showStats && (
        <StatsModal
          battleState={battleState}
          onClose={() => setShowStats(false)}
        />
      )}

      <Toaster />
    </motion.div>
  );
}

export default App;
