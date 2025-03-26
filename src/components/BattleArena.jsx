
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const SCORING_CRITERIA = [
  { name: "Fatality", points: 3 },
  { name: "Punch Line", points: 2 },
  { name: "Bom", points: 1 },
  { name: "Regular", points: 0.5 },
  { name: "Flow", points: 0.5 },
  { name: "C/C", points: 0.5 },
  { name: "Presença", points: 0.5 },
  { name: "Showman", points: 0.5 },
  { name: "Erro Grave", points: 0 },
];

function BattleArena({ battleState, setBattleState }) {
  const { toast } = useToast();

  const addScore = (mcIndex, points, criteriaName) => {
    setBattleState((prev) => {
      const mc = mcIndex === 1 ? "mc1" : "mc2";
      const newScores = [...prev[mc].scores];
      const currentRoundIndex = prev.currentRound - 1;
      newScores[currentRoundIndex] += points;
      
      // Add the move to the moves array for the current round
      const newMoves = [...prev[mc].moves];
      newMoves[currentRoundIndex] = [
        ...newMoves[currentRoundIndex],
        { name: criteriaName, points }
      ];

      return {
        ...prev,
        [mc]: {
          ...prev[mc],
          scores: newScores,
          moves: newMoves,
        },
      };
    });
  };

  const getCurrentRoundWinner = () => {
    const mc1Score = battleState.mc1.scores[battleState.currentRound - 1];
    const mc2Score = battleState.mc2.scores[battleState.currentRound - 1];
    
    if (mc1Score > mc2Score) return battleState.mc1.name;
    if (mc2Score > mc1Score) return battleState.mc2.name;
    return "Empate";
  };

  const getBattleWinner = () => {
    const mc1Wins = battleState.mc1.scores.filter((score, index) => 
      score > battleState.mc2.scores[index]
    ).length;
    
    const mc2Wins = battleState.mc2.scores.filter((score, index) => 
      score > battleState.mc1.scores[index]
    ).length;

    if (mc1Wins > mc2Wins) return battleState.mc1.name;
    if (mc2Wins > mc1Wins) return battleState.mc2.name;
    return "Empate";
  };

  const nextRound = () => {
    const winner = getCurrentRoundWinner();
    
    if (battleState.currentRound === 2) {
      const battleWinner = getBattleWinner();
      if (battleWinner === "Empate") {
        setBattleState((prev) => ({ ...prev, currentRound: 3 }));
        toast({
          title: "Terceiro Round!",
          description: "Empate nos rounds anteriores. Round decisivo iniciado!",
        });
      } else {
        toast({
          title: "Batalha Finalizada!",
          description: `${battleWinner} venceu a batalha!`,
        });
      }
    } else if (battleState.currentRound < 3) {
      setBattleState((prev) => ({ ...prev, currentRound: prev.currentRound + 1 }));
      toast({
        title: `Round ${battleState.currentRound} Finalizado!`,
        description: `Vencedor: ${winner}`,
      });
    }
  };

  return (
    <div className="mc-section">
      {[1, 2].map((mcNumber) => (
        <motion.div
          key={mcNumber}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mc-score-area"
        >
          <h2 className="mb-4 text-center text-2xl font-bold text-primary">
            {battleState[`mc${mcNumber}`].name}
            <span className="ml-2 text-sm text-muted-foreground">
              Round {battleState.currentRound}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {SCORING_CRITERIA.map((criteria) => (
              <Button
                key={criteria.name}
                onClick={() => addScore(mcNumber, criteria.points, criteria.name)}
                className="score-button h-16 bg-secondary hover:bg-secondary/80"
              >
                <div className="text-center">
                  <div className="text-sm">{criteria.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {criteria.points} pts
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-4 text-center text-xl font-bold">
            Pontuação: {battleState[`mc${mcNumber}`].scores[battleState.currentRound - 1].toFixed(1)}
          </div>
        </motion.div>
      ))}

      <div className="col-span-2 mt-6 flex justify-center">
        <Button
          onClick={nextRound}
          className="w-full max-w-md bg-primary text-lg font-bold hover:bg-primary/90"
          disabled={battleState.currentRound === 3 && getBattleWinner() !== "Empate"}
        >
          Próximo Round
        </Button>
      </div>
    </div>
  );
}

export default BattleArena;
