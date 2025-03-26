
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";

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

function StatsModal({ battleState, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const calculateTotalScore = (mc) => {
    return mc.scores.reduce((acc, score) => acc + score, 0);
  };

  const mc1Total = calculateTotalScore(battleState.mc1);
  const mc2Total = calculateTotalScore(battleState.mc2);

  const getWinner = () => {
    if (mc1Total > mc2Total) return battleState.mc1.name;
    if (mc2Total > mc1Total) return battleState.mc2.name;
    return "Empate";
  };

  const countMoves = (mc) => {
    const counts = {};
    SCORING_CRITERIA.forEach(criteria => {
      counts[criteria.name] = 0;
    });

    mc.moves.forEach(roundMoves => {
      roundMoves.forEach(move => {
        counts[move.name]++;
      });
    });

    return counts;
  };

  const getMaxMoveCount = (mc1Moves, mc2Moves) => {
    const allCounts = [...Object.values(mc1Moves), ...Object.values(mc2Moves)];
    return Math.max(...allCounts, 1);
  };

  const mc1Moves = countMoves(battleState.mc1);
  const mc2Moves = countMoves(battleState.mc2);
  const maxMoveCount = getMaxMoveCount(mc1Moves, mc2Moves);

  const downloadStats = () => {
    setIsDownloading(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const indent = 10;
    const subIndent = 15;

    // Helper functions
    const centerText = (text, y) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    const addLine = (text, y, fontSize = 12, indent = 10) => {
      doc.setFontSize(fontSize);
      doc.text(text, indent, y);
      return y + lineHeight;
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    centerText("RIMA JUSTA - RELATÓRIO DA BATALHA", yPos);
    yPos += lineHeight * 2;

    // Date
    doc.setFontSize(12);
    yPos = addLine(`Data: ${new Date().toLocaleDateString()}`, yPos);
    yPos += lineHeight;

    // Function to add MC stats with detailed moves
    const addMCStats = (mc) => {
      doc.setFont("helvetica", "bold");
      yPos = addLine(`${mc.name}`, yPos, 14);
      doc.setFont("helvetica", "normal");

      mc.scores.forEach((score, roundIndex) => {
        // Round header
        yPos = addLine(`Round ${roundIndex + 1}: ${score.toFixed(1)} pts`, yPos);
        
        // List all moves in this round
        if (mc.moves[roundIndex].length > 0) {
          mc.moves[roundIndex].forEach(move => {
            yPos = addLine(`- ${move.name}: ${move.points} pts`, yPos, 10, subIndent);
          });
        } else {
          yPos = addLine("- Sem pontuação registrada", yPos, 10, subIndent);
        }
        yPos += lineHeight/2;
      });

      yPos = addLine(`Total: ${calculateTotalScore(mc).toFixed(1)} pontos`, yPos);
      yPos += lineHeight;
    };

    // Add stats for both MCs
    addMCStats(battleState.mc1);
    addMCStats(battleState.mc2);

    // Winner
    doc.setFont("helvetica", "bold");
    yPos = addLine(`Vencedor: ${getWinner()}`, yPos, 14);
    yPos += lineHeight * 2;

    // Move frequency visualization
    doc.setFont("helvetica", "bold");
    yPos = addLine("Frequência de Movimentos:", yPos, 14);
    yPos += lineHeight;

    // Draw move frequency comparison
    const barWidth = 3;
    const maxBarHeight = 20;
    const spacing = 20;
    let xPos = indent;

    SCORING_CRITERIA.forEach((criteria, index) => {
      const mc1Count = mc1Moves[criteria.name];
      const mc2Count = mc2Moves[criteria.name];
      const mc1Height = (mc1Count / maxMoveCount) * maxBarHeight;
      const mc2Height = (mc2Count / maxMoveCount) * maxBarHeight;

      // Draw bars
      doc.setFillColor(255, 0, 0); // Red for MC1
      doc.rect(xPos, yPos - mc1Height, barWidth, mc1Height, 'F');
      doc.setFillColor(0, 0, 255); // Blue for MC2
      doc.rect(xPos + barWidth, yPos - mc2Height, barWidth, mc2Height, 'F');

      // Add move name and counts
      doc.setFontSize(8);
      doc.text(criteria.name, xPos, yPos + 5, { angle: 45 });
      doc.text(`${mc1Count}|${mc2Count}`, xPos, yPos + 10);

      xPos += spacing;
    });

    yPos += lineHeight * 6;

    // Legend
    doc.setFontSize(10);
    doc.setFillColor(255, 0, 0);
    doc.rect(indent, yPos, 5, 5, 'F');
    doc.text(`${battleState.mc1.name}`, indent + 8, yPos + 4);
    
    doc.setFillColor(0, 0, 255);
    doc.rect(indent + 50, yPos, 5, 5, 'F');
    doc.text(`${battleState.mc2.name}`, indent + 58, yPos + 4);

    // Save the PDF
    const fileName = `batalha-${battleState.mc1.name}-vs-${battleState.mc2.name}-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    setIsDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="stats-modal"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="mx-4 w-full max-w-2xl rounded-lg border border-border bg-card p-6"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-primary">
          Estatísticas da Batalha
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {[battleState.mc1, battleState.mc2].map((mc, index) => (
            <div key={index} className="space-y-4 rounded-lg bg-secondary p-4">
              <h3 className="text-xl font-bold">{mc.name}</h3>
              
              {mc.scores.map((score, roundIndex) => (
                <div key={roundIndex} className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Round {roundIndex + 1}:</span>
                    <span>{score.toFixed(1)} pts</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {mc.moves[roundIndex].map((move, moveIndex) => (
                      <div key={moveIndex} className="flex justify-between pl-4 text-muted-foreground">
                        <span>{move.name}</span>
                        <span>{move.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mt-2 border-t border-border pt-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-primary">
                    {calculateTotalScore(mc).toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-4 text-lg font-bold">Frequência de Movimentos</h3>
          <div className="relative h-40 w-full overflow-hidden rounded-lg bg-secondary p-4">
            <div className="flex h-full items-end justify-around">
              {SCORING_CRITERIA.map((criteria) => (
                <div key={criteria.name} className="group relative flex flex-col items-center">
                  <div className="flex gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(mc1Moves[criteria.name] / maxMoveCount) * 100}%` }}
                      className="w-3 bg-primary"
                      style={{ maxHeight: "100%" }}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(mc2Moves[criteria.name] / maxMoveCount) * 100}%` }}
                      className="w-3 bg-destructive"
                      style={{ maxHeight: "100%" }}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-bold">
                      {mc1Moves[criteria.name]}|{mc2Moves[criteria.name]}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {criteria.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-primary" />
              <span>{battleState.mc1.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-destructive" />
              <span>{battleState.mc2.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xl font-bold">
          Vencedor:{" "}
          <span className="text-primary">
            {getWinner()}
          </span>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={downloadStats}
            variant="secondary"
            className="w-40"
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Baixando..." : "Baixar PDF"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-40"
          >
            Fechar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StatsModal;
